import {
  LinkIcon,
  QRIcon,
  DownloadIcon,
  FullscreenIcon,
  ExitFullscreenIcon,
  EditIcon,
} from './icons';

export function Toolbar({
  onCopy,
  onQR,
  onDownload,
  onFullscreen,
  onEdit,
  isFullscreen,
  visible,
}) {
  return (
    <div
      className={`
        absolute bottom-0 left-0 right-0
        flex items-center justify-center gap-3
        p-4 bg-black/35 backdrop-blur-sm
        transition-opacity duration-300 z-10
        ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <ToolbarButton title="Copy link" onClick={onCopy}>
        <LinkIcon />
      </ToolbarButton>
      <ToolbarButton title="QR code" onClick={onQR}>
        <QRIcon />
      </ToolbarButton>
      <ToolbarButton title="Download" onClick={onDownload}>
        <DownloadIcon />
      </ToolbarButton>
      <ToolbarButton title="Toggle fullscreen" onClick={onFullscreen}>
        {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
      </ToolbarButton>
      <ToolbarButton title="Edit name" onClick={onEdit}>
        <EditIcon />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="
        bg-transparent border-none text-white/80
        cursor-pointer text-xl p-1.5 rounded-md
        shrink-0 flex items-center justify-center
        transition-colors duration-150
        hover:text-white hover:bg-white/15
        focus-visible:text-white focus-visible:bg-white/15
      "
    >
      {children}
    </button>
  );
}
