<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/* Length that works even if the mbstring extension is switched off on the server. */
function text_length(string $value): int {
    return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
}

/* ------------------------------------------------------------------ */
/* 1. Request + form validation                                        */
/* ------------------------------------------------------------------ */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['success' => false, 'message' => 'Invalid request. Please submit the form.']);
}

$name = trim((string)($_POST['name'] ?? ''));
$phone = trim((string)($_POST['contact_number'] ?? ''));
$description = trim((string)($_POST['description'] ?? ''));
/* Plan is only sent when the visitor came from Explore Starter / Pro / Enterprise. */
$plan = trim((string)($_POST['plan'] ?? ''));
if (!in_array($plan, ['Starter', 'Pro', 'Enterprise'], true)) {
    $plan = '';
}

if ($name === '' || strlen($name) > 400 || $phone === '' || strlen($phone) > 20) {
    respond(400, ['success' => false, 'message' => 'Please enter your name and a valid contact number.']);
}
if ($description === '' || text_length($description) > 1000) {
    respond(400, ['success' => false, 'message' => 'Please enter a short description (up to 1000 characters).']);
}
if (preg_match('/[\r\n]/', $name) || preg_match('/[\r\n]/', $phone)) {
    respond(400, ['success' => false, 'message' => 'Please check the details you entered.']);
}

/* ------------------------------------------------------------------ */
/* 2. Mail settings (mail-config.php)                                  */
/* ------------------------------------------------------------------ */
$setupIncomplete = 'Email setup is incomplete. Please contact the website administrator.';

$configPath = __DIR__ . '/mail-config.php';
if (!is_file($configPath)) {
    error_log('RenAi enquiry: mail-config.php is missing.');
    respond(500, ['success' => false, 'message' => $setupIncomplete]);
}
$config = require $configPath;
if (!is_array($config)) {
    error_log('RenAi enquiry: mail-config.php must return an array.');
    respond(500, ['success' => false, 'message' => $setupIncomplete]);
}

$appPassword = preg_replace('/\s+/', '', (string)($config['smtp_app_password'] ?? ''));
$username = trim((string)($config['smtp_username'] ?? ''));
$recipient = trim((string)($config['recipient'] ?? ''));
$debug = !empty($config['debug']);                 /* true = show the real reason on the page (setup only) */
$caFile = trim((string)($config['cafile'] ?? ''));  /* optional: path to cacert.pem if TLS certificate check fails */

if ($username === '' || $recipient === '' || $appPassword === '' ||
    strpos($appPassword, 'PASTE_YOUR_16_CHARACTER') !== false) {
    respond(500, ['success' => false, 'message' => 'Email setup is incomplete. Add your Google App Password to mail-config.php.']);
}
if (!filter_var($recipient, FILTER_VALIDATE_EMAIL) || !filter_var($username, FILTER_VALIDATE_EMAIL)) {
    error_log('RenAi enquiry: smtp_username / recipient in mail-config.php is not a valid email address.');
    respond(500, ['success' => false, 'message' => 'Email setup is incomplete. An email address in mail-config.php is not valid.']);
}
if (!extension_loaded('openssl')) {
    error_log('RenAi enquiry: the PHP openssl extension is not enabled.');
    respond(500, [
        'success' => false,
        'message' => $debug
            ? 'The PHP "openssl" extension is turned off. Enable extension=openssl in php.ini and restart PHP.'
            : $setupIncomplete,
    ]);
}

$phpmailerDir = __DIR__ . '/PHPMailer-master/src/';
foreach (['Exception.php', 'PHPMailer.php', 'SMTP.php'] as $file) {
    if (!is_file($phpmailerDir . $file)) {
        error_log('RenAi enquiry: PHPMailer file missing: ' . $file);
        respond(500, ['success' => false, 'message' => $setupIncomplete]);
    }
    require_once $phpmailerDir . $file;
}

/* ------------------------------------------------------------------ */
/* 3. Send. Port 587 (STARTTLS) first, then port 465 (SSL) as backup   */
/*    because many networks block one of the two.                      */
/* ------------------------------------------------------------------ */
$body = "A new enquiry was submitted on the RenAi website.\n\n"
    . "Full Name: " . $name . "\n"
    . "Contact Number: " . $phone . "\n"
    . ($plan !== '' ? "Selected Plan: " . $plan . "\n" : '')
    . "Description: " . $description . "\n";

$attempts = [
    ['port' => 587, 'secure' => PHPMailer::ENCRYPTION_STARTTLS],
    ['port' => 465, 'secure' => PHPMailer::ENCRYPTION_SMTPS],
];
$lastError = '';

foreach ($attempts as $try) {
    $mail = new PHPMailer(true);
    try {
        $mail->CharSet = PHPMailer::CHARSET_UTF8;
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = $username;
        $mail->Password = $appPassword;
        $mail->SMTPSecure = $try['secure'];
        $mail->Port = $try['port'];
        $mail->Timeout = 15;
        if ($caFile !== '' && is_file($caFile)) {
            $mail->SMTPOptions = ['ssl' => ['cafile' => $caFile]];
        }

        $mail->setFrom($username, 'RenAi Website Enquiry');
        $mail->addAddress($recipient);
        $mail->Subject = 'New RenAi Website Enquiry';
        $mail->Body = $body;

        $mail->send();
        respond(200, ['success' => true, 'message' => 'Thank you! Your details have been submitted successfully.']);
    } catch (\Throwable $e) {
        $lastError = trim((string)($mail->ErrorInfo !== '' ? $mail->ErrorInfo : $e->getMessage()));
        error_log('RenAi enquiry email failed on port ' . $try['port'] . ': ' . $lastError);
        /* A rejected login will not be fixed by trying another port. */
        if (stripos($lastError, 'authenticate') !== false || strpos($lastError, '535') !== false) {
            break;
        }
    }
}

/* ------------------------------------------------------------------ */
/* 4. Every attempt failed: explain WHY (full detail only if debug)    */
/* ------------------------------------------------------------------ */
$hint = 'Unknown mail error. See the PHP error log for details.';
if (stripos($lastError, 'authenticate') !== false || strpos($lastError, '535') !== false) {
    $hint = 'Gmail rejected the login. Turn on 2-Step Verification, create a NEW Google App Password and paste it into mail-config.php (smtp_app_password).';
} elseif (stripos($lastError, 'certificate') !== false || stripos($lastError, 'ssl') !== false || stripos($lastError, 'crypto') !== false) {
    $hint = 'The TLS certificate check failed on this computer. Download cacert.pem, then set openssl.cafile in php.ini (or put its path in "cafile" in mail-config.php) and restart PHP.';
} elseif (stripos($lastError, 'connect') !== false || stripos($lastError, 'timed out') !== false || stripos($lastError, 'resolve') !== false) {
    $hint = 'Could not connect to smtp.gmail.com on ports 587 or 465. Check the internet connection and whether a firewall, antivirus or the hosting provider blocks outgoing SMTP.';
}

respond(500, [
    'success' => false,
    'message' => $debug
        ? $hint . ' [' . $lastError . ']'
        : 'We could not send your details right now. Please try again later.',
]);
