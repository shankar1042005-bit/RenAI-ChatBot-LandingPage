<?php
/*
 * Local SMTP configuration for the RenAi enquiry form.
 * Replace the placeholder with a Google App Password (not your normal Gmail password).
 * 'recipient' is the inbox that receives the enquiries - change it here any time (no other file needs editing).
 * Do not publish this file or share it with anyone.
 *
 * 'debug'  => true  shows the real reason on the form when sending fails (use while setting up).
 *             Set it to false before the site goes live.
 * 'cafile' => optional full path to cacert.pem. Only needed if the error mentions a TLS/SSL certificate.
 */
return [
    'smtp_username' => 'shankar1042005@gmail.com',
    'smtp_app_password' => 'ymonkvfdngnohjub',
    'recipient' => 'shankar1042005@gmail.com',
    'debug' => true,
    'cafile' => '',
];
