import { PlusSquareIcon, ShareIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('transitionend', handler);
  }, []);

  const onClick = (evt: any) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    (promptInstall as any).prompt();
  };
  if (!supportsPWA) {
    return (
      <div className="text-dark flex flex-col items-center text-base">
        Click{' '}
        <span className="flex gap-1 p-2 font-bold">
          {' '}
          Share <ShareIcon />{' '}
        </span>{' '}
        and{' '}
        <span className="flex gap-1 p-2 font-bold">
          {' '}
          Add to Home Screen <PlusSquareIcon />{' '}
        </span>{' '}
        to install the App!
      </div>
    );
  }
  return (
    <button
      type="button"
      className="link-button text-bold w-4/5 max-w-80 rounded-lg p-4 text-xl text-white"
      id="setup_button"
      aria-label="Install app"
      title="Install app"
      onClick={onClick}
    >
      Install
    </button>
  );
}

export default InstallPWA;
