CREATE TABLE `invoice_send_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`from_email` text NOT NULL,
	`to_email` text NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'sent' NOT NULL,
	`error_message` text,
	`sent_at` text NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `company_settings` ADD `sender_email_primary` text;--> statement-breakpoint
ALTER TABLE `company_settings` ADD `sender_email_secondary` text;