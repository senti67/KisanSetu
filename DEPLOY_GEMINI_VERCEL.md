# KisanSetu deployment checklist

- [ ] Create a Gemini API key in Google AI Studio.
- [ ] Keep the key private.
- [ ] Push this project to GitHub.
- [ ] Import the repo into Vercel.
- [ ] Add `GEMINI_API_KEY` under Vercel Environment Variables.
- [ ] Redeploy after adding the variable.
- [ ] Test the main site.
- [ ] Open Kisan Mitra and send a question.
- [ ] If the chatbot returns `Missing GEMINI_API_KEY`, the Vercel variable
      was not added to the deployed environment or the project was not
      redeployed after adding it.
