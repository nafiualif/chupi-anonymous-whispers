# Chupi: Share Your Thoughts

Build an anonymous messaging web app called "Chupi" with the following features:

1. AUTHENTICATION

- Users can sign up and log in using email/password

- After signup, redirect to a dashboard

2. UNIQUE SHAREABLE LINK

- Each user gets a unique profile link like /u/[random-username-or-id]

- Show this link on their dashboard with a "Copy Link" button

- Include a "Share to Instagram Story" button if possible

3. PUBLIC MESSAGE PAGE (for the link /u/[id])

- Anyone visiting this link (no login required) sees a simple page with the recipient's display name and a text box

- A "Send Anonymous Message" button submits the message

- Do NOT ask the sender for their name, email, or any identifying info

- Show a friendly confirmation like "Your message was sent anonymously!" after submitting

- Add basic rate limiting: block more than 5 messages from the same IP within 10 minutes to prevent spam

4. INBOX (for logged-in user)

- Show all received anonymous messages in a card/list format, newest first

- Each message has a "Reply publicly" option that lets them post the message + their reply as a story-style card they can screenshot or share

- Add a "Delete" and "Report as abusive" button on each message

5. CONTENT MODERATION

- Filter out messages containing hate speech, harassment, sexual content, or bullying language before they reach the inbox

- If a message is flagged, don't deliver it and show the sender a message like "This message couldn't be sent"

6. DATABASE STRUCTURE

- users table: id, email, password_hash, display_name, unique_link_slug, created_at

- messages table: id, recipient_id, content, created_at, is_flagged

7. DESIGN

- App name is "Chupi" — show this as the logo/brand name on the homepage, login page, and dashboard header

- Clean, modern, mobile-friendly UI

- Soft gradient background, rounded cards, minimal color palette (e.g., purple/pink pastel theme)

- Should feel welcoming and safe, not intimidating

8. SAFETY FEATURES

- Add a small footer note: "If you're receiving hurtful messages, you can disable your link anytime in settings"

- Add a toggle in settings to temporarily turn off the public message link

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://chupi-anonymous-whispers.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9c92b809-2d14-42e2-8b71-71333c03ac0f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
