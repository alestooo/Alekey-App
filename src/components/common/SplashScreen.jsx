import logoAlekey from "../../assets/images/alekey-logo.jpeg";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white animate-in fade-in duration-500">
      <div className="relative flex flex-col items-center">
        <div className="w-36 h-36 mb-6 animate-bounce-slow">
          <img
            src={logoAlekey}
            alt="Alekey Logo"
            className="w-full h-full object-contain rounded-full shadow-2xl border-4 border-[#8ED4BE]/20"
          />
        </div>

        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 animate-pulse-gentle">
          Alekey
          <span className="text-[#8ED4BE]">
            .
          </span>
        </h1>

        <div className="mt-8 w-48 h-1.5 bg-slate-50 rounded-full overflow-hidden">
          <div className="h-full bg-[#8ED4BE] animate-progress-load rounded-full" />
        </div>
      </div>
    </div>
  );
}