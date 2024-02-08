import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from 'sonner';

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void;
}

let speechRecognition: SpeechRecognition | null = null;


export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [content, setContent] = useState('');

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);
    
    if (event.target.value === '') {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault();

    if (content === "") {
      return;
    }
    
    onNoteCreated(content);

    setContent("");
    setShouldShowOnboarding(true);

    toast.success('Nota criada com sucesso');
  }

  function handleCloseCard() {
    if (content === "") {
      setShouldShowOnboarding(true);
    }
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =  "SpeechRecognition" in window
      || "webkitSpeechRecognition" in window
    
    if (!isSpeechRecognitionAPIAvailable) {
      alert("Infelizmente seu navegador não suporta a API de gravação!");
      return;
    }
    
    setIsRecording(true);
    setShouldShowOnboarding(false);

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.lang = "pt-BR";
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, "");

      setContent(transcription);
    }

    speechRecognition.onerror = (event) => {
      console.error(event);
    }

    speechRecognition.start();
    
  }
  
  function handleStopRecording() {
    setIsRecording(false);

    if (speechRecognition !== null) {
      speechRecognition.stop();
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 p-5 gap-3 text-left outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-teal-400 shadow-lg shadow-black/50">
        <span className="text-sm font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='inset-0 fixed bg-black/50' />
        <Dialog.Content className='fixed overflow-hidden md:h-[60vh] inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full bg-slate-700 md:rounded-md flex flex-col outline-none'>
          <Dialog.Close onClick={handleCloseCard} className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100 rounded-bl-lg md:rounded-tr-lg focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400 outline-none'>
            <X className='size-5' />
          </Dialog.Close>

          <form className="flex flex-1 flex-col">
            <div className='flex flex-1 flex-col gap-3 p-5'>
              <span className="text-sm font-medium text-slate-400">
                Adicionar nota
              </span>
              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400">
                  Comece <button type="button" onClick={handleStartRecording} className="font-medium text-teal-400 hover:underline">gravando uma nota</button> em áudio ou se preferir <button type="button" onClick={handleStartEditor} className="font-medium text-teal-400 hover:underline">utilize apenas texto</button>.
                </p>
              ) : (
                <textarea 
                  autoFocus
                  value={content}
                  className=" text-sm leading-6 text-slate-400 bg-transparent resize-none flex flex-1 outline-none"
                  onChange={handleContentChange}
                  />
                  )}
            </div>

            {isRecording ? (
              <button 
                type="button"
                onClick={handleStopRecording}
                className='flex items-center justify-center gap-2 outline-none rounded-b-lg bg-slate-900 py-4 text-sm text-slate-300 font-medium hover:text-slate-100 focus-visible:bg-teal-500 focus-visible:text-teal-50 focus:ring focus-visible:ring-inset focus-visible:ring-teal-100'
                >
                  <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                  Gravando! (clique p/ interromper)
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSaveNote}
                className='outline-none md:rounded-b-lg bg-teal-400 py-4 text-sm text-teal-950 font-medium hover:bg-teal-500 focus-visible:bg-teal-500 focus-visible:text-teal-50 focus:ring focus-visible:ring-inset focus-visible:ring-teal-100'
                >
                Salvar nota
              </button>
            )}

          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}