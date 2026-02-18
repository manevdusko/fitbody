# Telegram Bot Setup for Contact Form

## Overview
Contact form submissions will be sent to:
1. **Telegram** - Instant notification
2. **Email** - Backup notification to admin email

## Step 1: Create Telegram Bot

### 1.1 Talk to BotFather
1. Open Telegram
2. Search for `@BotFather`
3. Start a chat and send: `/newbot`
4. Follow the prompts:
   - **Bot name**: FitBody Contact Bot (or any name you like)
   - **Bot username**: Must end in 'bot' (e.g., `fitbody_contact_bot`)

### 1.2 Get Bot Token
BotFather will give you a token like:
```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Save this token!** You'll need it in Step 3.

## Step 2: Get Your Chat ID

### 2.1 Start Chat with Your Bot
1. Search for your bot username in Telegram
2. Click "Start" or send any message

### 2.2 Get Chat ID
**Option A: Use a bot**
1. Search for `@userinfobot` in Telegram
2. Start a chat
3. It will show your Chat ID (a number like `123456789`)

**Option B: Use API**
1. Send a message to your bot
2. Open this URL in browser (replace `YOUR_BOT_TOKEN`):
```
https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
```
3. Look for `"chat":{"id":123456789}` in the response
4. That number is your Chat ID

## Step 3: Configure WordPress

### Option A: Add to wp-config.php (Recommended)

Edit `/wp-config.php` and add these lines BEFORE `/* That's all, stop editing! */`:

```php
// Telegram Bot Configuration
define('TELEGRAM_BOT_TOKEN', '123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
define('TELEGRAM_CHAT_ID', '123456789');
```

Replace with your actual token and chat ID.

### Option B: Add via WordPress Admin

If you prefer, you can add these as WordPress options:

1. Go to WordPress Admin
2. Tools → Site Health → Info → Constants
3. Or add via code:

```php
update_option('telegram_bot_token', '123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
update_option('telegram_chat_id', '123456789');
```

## Step 4: Upload Updated Files

Upload these files to your WordPress server:

1. **wordpress-theme/functions.php** - Contains contact form handler
2. **Frontend files** (will be deployed automatically via GitHub)

## Step 5: Test

1. Go to https://staging.fitbody.mk/contact
2. Fill out the contact form
3. Submit
4. You should receive:
   - ✅ Telegram notification (instant)
   - ✅ Email notification (to admin email)

## Telegram Message Format

You'll receive messages like this:

```
🔔 Нова порака од контакт форма

👤 Име: Иван Петровски
📧 Email: ivan@example.com
📱 Телефон: 070 123 456
📋 Тема: Прашање за производ

💬 Порака:
Дали имате на залиха Whey Protein 2kg?
```

## Troubleshooting

### Not Receiving Telegram Messages?

**Check 1: Bot Token**
```bash
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
```
Should return bot info. If error, token is wrong.

**Check 2: Chat ID**
```bash
curl https://api.telegram.org/bot<YOUR_TOKEN>/sendMessage?chat_id=<YOUR_CHAT_ID>&text=Test
```
Should send "Test" message. If error, chat ID is wrong.

**Check 3: WordPress Logs**
Check `/wp-content/debug.log` for errors:
```
Telegram credentials not configured
Telegram API error: ...
```

**Check 4: Started Bot?**
Make sure you clicked "Start" in your bot chat.

### Not Receiving Emails?

**Check 1: WordPress Email**
Test WordPress email:
```php
wp_mail('your@email.com', 'Test', 'This is a test');
```

**Check 2: SMTP Plugin**
Consider installing WP Mail SMTP plugin for reliable email delivery.

**Check 3: Spam Folder**
Check your spam/junk folder.

## Security Notes

1. **Never commit tokens to Git!**
   - Tokens are in `wp-config.php` (not in Git)
   - Or use WordPress options (stored in database)

2. **Keep tokens secret**
   - Don't share your bot token
   - Don't post it publicly

3. **Regenerate if compromised**
   - Talk to @BotFather
   - Send: `/token`
   - Select your bot
   - Get new token

## Advanced: Group Chat

To send to a Telegram group:

1. Create a group
2. Add your bot to the group
3. Make bot an admin
4. Get group chat ID (will be negative, like `-123456789`)
5. Use that as `TELEGRAM_CHAT_ID`

## Files Modified

1. `wordpress-theme/functions.php` - Added:
   - `fitbody_handle_contact_form()` - Contact form handler
   - `fitbody_send_telegram_message()` - Telegram API integration
   - REST API endpoint: `POST /wp-json/fitbody/v1/contact`

2. `src/utils/api.ts` - Added:
   - `contactApi.submit()` - Frontend API call

3. `pages/contact.tsx` - Updated:
   - Form submission to use real API
   - Error handling

## Testing Checklist

- [ ] Created Telegram bot
- [ ] Got bot token
- [ ] Got chat ID
- [ ] Added credentials to wp-config.php
- [ ] Uploaded functions.php
- [ ] Tested contact form
- [ ] Received Telegram notification
- [ ] Received email notification

---

**Need Help?** Check WordPress error log or Telegram API response for details.
