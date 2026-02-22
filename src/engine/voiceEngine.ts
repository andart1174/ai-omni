export interface VoiceCommand {
    action: 'convert' | 'enhance' | 'note' | 'unknown';
    params?: Record<string, any>;
}

export class VoiceEngine {
    private recognition: any;
    private isListening: boolean = false;

    constructor() {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US'; // Default, can be expanded to ro-RO
        }
    }

    public startListening(onResult: (command: VoiceCommand, transcript: string) => void): void {
        if (!this.recognition || this.isListening) return;

        this.isListening = true;
        this.recognition.start();

        this.recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            const command = this.parseTranscript(transcript);
            onResult(command, transcript);
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };

        this.recognition.onerror = () => {
            this.isListening = false;
        };
    }

    public parseTranscript(transcript: string): VoiceCommand {
        if (transcript.includes('convert to')) {
            const format = transcript.split('convert to')[1].trim();
            return { action: 'convert', params: { format } };
        }

        if (transcript.includes('increase') || transcript.includes('enhance')) {
            return { action: 'enhance', params: { type: 'auto' } };
        }

        if (transcript.includes('note') || transcript.includes('write')) {
            return { action: 'note', params: { content: transcript } };
        }

        return { action: 'unknown' };
    }
}

export const voiceEngine = new VoiceEngine();
