import { Loader2 } from 'lucide-react';

function Loader({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
    </div>
  );
}

export default Loader;