export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-text">Privacy Policy</h1>
      <p className="mt-6 text-muted">
        House Compass stores your calculator inputs locally in your browser session to display results. If
        you create an account, calculations and favorite cities you explicitly choose get saved to your
        own account via Firebase Authentication and Firestore. We do not sell your data or share it with third
        parties. This is a sample MVP application; do not enter sensitive personal or financial information
        beyond what&apos;s needed to use the calculator.
      </p>
    </div>
  );
}
