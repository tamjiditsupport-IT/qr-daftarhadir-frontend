import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import api from '../utils/axios';
import { CheckCircle, XCircle, Info, LogIn } from 'lucide-react';

export default function Scanner() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; name?: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch running meetings
  const { data: meetings, isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const res = await api.get('/meetings');
      return res.data.data;
    }
  });

  const runningMeetings = meetings?.filter((m: any) => m.status === 'running') || [];

  useEffect(() => {
    // If only one running meeting, auto select it
    if (runningMeetings.length === 1 && !selectedMeetingId) {
      setSelectedMeetingId(runningMeetings[0].id);
    }
  }, [runningMeetings, selectedMeetingId]);

  useEffect(() => {
    // Auto-hide scan result after 3 seconds
    if (scanResult) {
      const timer = setTimeout(() => {
        setScanResult(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanResult]);

  useEffect(() => {
    if (selectedMeetingId && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
        /* verbose= */ false
      );

      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          // Pause scanning temporarily to avoid multiple hits
          scanner.pause(true);
          
          try {
            const res = await api.post('/attendance/scan', {
              meeting_id: selectedMeetingId,
              qr_code: decodedText
            });

            // Play success sound
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(e => console.log('Audio play failed', e));
            }

            setScanResult({
              success: true,
              message: res.data.message || 'Berhasil mencatat kehadiran',
              name: res.data.name
            });
            
          } catch (err: any) {
            setScanResult({
              success: false,
              message: err.response?.data?.message || 'Gagal memindai',
            });
          }

          // Resume after 2 seconds
          setTimeout(() => {
            if (scannerRef.current) scannerRef.current.resume();
          }, 2000);
        },
        (error) => {
          // Ignore scanning errors (like no QR code found in current frame)
        }
      );
      
      setIsScanning(true);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        scannerRef.current = null;
        setIsScanning(false);
      }
    };
  }, [selectedMeetingId]);

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <LogIn className="text-blue-500" />
            Scanner Kehadiran
          </h1>
        </div>

        {/* Meeting Selection */}
        {!selectedMeetingId ? (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Pilih Rapat Aktif</h2>
            {isLoading ? (
              <p className="text-slate-400 text-sm">Memuat rapat...</p>
            ) : runningMeetings.length === 0 ? (
              <div className="p-4 bg-yellow-900/30 text-yellow-500 rounded-lg flex items-center gap-3 border border-yellow-800/50">
                <Info size={20} />
                Tidak ada rapat yang sedang berlangsung. Silakan mulai rapat terlebih dahulu.
              </div>
            ) : (
              <div className="space-y-3">
                {runningMeetings.map((m: any) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMeetingId(m.id)}
                    className="w-full text-left p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600 flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-lg text-white">{m.title}</div>
                      <div className="text-sm text-slate-400 mt-1">{new Date(m.start_time).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bg-green-900/50 text-green-400 text-xs px-3 py-1.5 rounded border border-green-800 group-hover:bg-green-800 group-hover:text-white transition-colors">
                      Pilih
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col items-center">
            
            <div className="w-full flex justify-between items-center mb-6">
              <div>
                <div className="text-sm text-slate-400">Rapat Terpilih:</div>
                <div className="font-semibold text-white">{runningMeetings.find((m: any) => m.id === selectedMeetingId)?.title}</div>
              </div>
              <button 
                onClick={() => setSelectedMeetingId(null)}
                className="text-sm text-slate-400 hover:text-white transition-colors underline"
              >
                Ganti Rapat
              </button>
            </div>

            {/* Notification Area */}
            <div className="h-20 w-full mb-4">
              {scanResult && (
                <div className={`p-4 rounded-lg flex items-center gap-3 font-medium transition-all duration-300 ${scanResult.success ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                  {scanResult.success ? <CheckCircle size={24} /> : <XCircle size={24} />}
                  <div>
                    {scanResult.name && <div className="text-lg font-bold text-white mb-0.5">{scanResult.name}</div>}
                    <div className="text-sm">{scanResult.message}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Scanner Container */}
            <div className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-slate-700 bg-black">
              <div id="qr-reader" className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full"></div>
            </div>
            
            <p className="text-slate-400 text-sm mt-6 text-center">
              Arahkan QR Code ke kamera untuk melakukan absensi otomatis.
            </p>

            {/* Audio for success beep */}
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
          </div>
        )}
      </div>
      <style>{`
        #qr-reader {
          border: none !important;
        }
        #qr-reader__dashboard_section_csr span {
          color: white !important;
        }
        #qr-reader__dashboard_section_csr button {
          background-color: #3b82f6 !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          margin: 10px 0 !important;
          cursor: pointer !important;
        }
        #qr-reader__camera_selection {
          background-color: #1e293b !important;
          color: white !important;
          border: 1px solid #334155 !important;
          padding: 8px !important;
          border-radius: 8px !important;
          width: 100% !important;
          margin-bottom: 10px !important;
        }
      `}</style>
    </div>
  );
}
