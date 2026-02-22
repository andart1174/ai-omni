import { fetchFile } from '@ffmpeg/util';
import { loadFFmpeg } from './videoEngine';

export type AudioFormat = 'mp3' | 'wav' | 'flac' | 'm4a' | 'ogg';

export const convertAudio = async (
    file: File,
    targetFormat: AudioFormat,
    onProgress?: (progress: number) => void
): Promise<string> => {
    const ffmpeg = await loadFFmpeg();

    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const inputName = `audio_input${extension || '.mp3'}`;
    const outputName = `audio_output.${targetFormat}`;

    try {
        const fileData = await fetchFile(file);
        await ffmpeg.writeFile(inputName, fileData);

        ffmpeg.on('progress', ({ progress }: { progress: number }) => {
            if (onProgress) onProgress(progress * 100);
        });

        let args = ['-i', inputName, '-y', outputName];

        if (targetFormat === 'mp3') {
            args = ['-i', inputName, '-codec:a', 'libmp3lame', '-q:a', '2', '-ar', '44100', '-ac', '2', '-y', outputName];
        } else if (targetFormat === 'wav') {
            args = ['-i', inputName, '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', '-y', outputName];
        } else if (targetFormat === 'flac') {
            args = ['-i', inputName, '-c:a', 'flac', '-y', outputName];
        }

        const resultCode = await ffmpeg.exec(args);
        if (resultCode !== 0) throw new Error("Audio conversion failed in engine.");

        const data = await ffmpeg.readFile(outputName);
        const mimeType = `audio/${targetFormat === 'mp3' ? 'mpeg' : targetFormat}`;

        // Fix for SharedArrayBuffer type mismatch in Blob constructor
        const buffer = (data as any).buffer ? (data as any).buffer : data;
        return URL.createObjectURL(new Blob([buffer], { type: mimeType }));
    } catch (err: any) {
        throw new Error(err.message || String(err));
    }
};

export const editAudioMetadata = async (file: File, metadata: { title?: string, artist?: string }): Promise<string> => {
    const ffmpeg = await loadFFmpeg();
    const inputName = 'meta_in.mp3';
    const outputName = 'meta_out.mp3';

    try {
        const fileData = await fetchFile(file);
        await ffmpeg.writeFile(inputName, fileData);

        const args = ['-i', inputName, '-c', 'copy',
            '-metadata', `title=${metadata.title || ''}`,
            '-metadata', `artist=${metadata.artist || ''}`,
            '-y', outputName];

        await ffmpeg.exec(args);
        const data = await ffmpeg.readFile(outputName);
        const buffer = (data as any).buffer ? (data as any).buffer : data;
        return URL.createObjectURL(new Blob([buffer], { type: 'audio/mpeg' }));
    } catch (err: any) {
        throw new Error(`Metadata Error: ${err.message}`);
    }
};
