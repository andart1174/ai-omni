import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export type VideoFormat = 'mp4' | 'webm' | 'avi' | 'mov' | 'gif' | 'mp3' | '9-16' | 'highlights' | 'shorts';

let loadedFfmpeg: FFmpeg | null = null;
let lastLogs: string[] = [];

export const loadFFmpeg = async () => {
    if (loadedFfmpeg) return loadedFfmpeg;

    try {
        const ffmpegInstance = new FFmpeg();
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

        ffmpegInstance.on('log', ({ message }: { message: string }) => {
            console.log('FFmpeg Log:', message);
            lastLogs.push(message);
            if (lastLogs.length > 20) lastLogs.shift();
        });

        await ffmpegInstance.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        loadedFfmpeg = ffmpegInstance;
        return loadedFfmpeg;
    } catch (err: any) {
        loadedFfmpeg = null;
        const errorMsg = err instanceof Error ? err.message : String(err);
        throw new Error(`FFmpeg Load Error: ${errorMsg}. Please ensure your browser supports SharedArrayBuffer.`);
    }
};

export const convertVideo = async (
    file: File,
    targetFormat: VideoFormat,
    onProgress?: (progress: number) => void
): Promise<string> => {
    let ffmpeg;
    try {
        ffmpeg = await loadFFmpeg();
    } catch (e: any) {
        throw new Error(e.message);
    }

    lastLogs = []; // Reset logs for new conversion
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const inputName = `input_temp${extension || '.mp4'}`;
    const isSocial = ['9-16', 'highlights', 'shorts'].includes(targetFormat);
    const outputName = isSocial ? `output_reels.mp4` : `output.${targetFormat}`;

    try {
        const fileData = await fetchFile(file);
        await ffmpeg.writeFile(inputName, fileData);

        ffmpeg.on('progress', ({ progress }: { progress: number }) => {
            if (onProgress) onProgress(progress * 100);
        });

        let args: string[] = [];

        switch (targetFormat) {
            case 'gif':
                args = ['-i', inputName, '-vf', 'fps=10,scale=480:-1:flags=lanczos', '-y', outputName];
                break;
            case 'mp3':
                // Forcing mp3 format and using a standard bitrate
                args = ['-i', inputName, '-vn', '-b:a', '128k', '-ar', '44100', '-f', 'mp3', '-y', outputName];
                break;
            case '9-16':
                args = ['-i', inputName, '-vf', 'crop=ih*9/16:ih,scale=480:854', '-c:v', 'libx264', '-crf', '28', '-preset', 'ultrafast', '-c:a', 'copy', '-y', outputName];
                break;
            case 'highlights':
                args = ['-i', inputName, '-ss', '0', '-t', '15', '-c', 'copy', '-y', outputName];
                break;
            case 'shorts':
                args = ['-i', inputName, '-ss', '0', '-t', '15', '-vf', 'crop=ih*9/16:ih,scale=480:854', '-c:v', 'libx264', '-crf', '28', '-preset', 'ultrafast', '-y', outputName];
                break;
            default:
                args = ['-i', inputName, '-c', 'copy', '-y', outputName];
                if (targetFormat === 'webm') {
                    args = ['-i', inputName, '-c:v', 'libvpx', '-crf', '30', '-b:v', '0', '-c:a', 'libvorbis', '-y', outputName];
                }
        }

        const resultCode = await ffmpeg.exec(args);

        if (resultCode !== 0) {
            const lastError = lastLogs.slice(-3).join(' | ');
            throw new Error(`FFmpeg failed (Code ${resultCode}). Info: ${lastError || 'Check codec compatibility.'}`);
        }

        const data = await ffmpeg.readFile(outputName);
        const mimeType = targetFormat === 'mp3' ? 'audio/mpeg' :
            targetFormat === 'gif' ? 'image/gif' :
                targetFormat === 'webm' ? 'video/webm' :
                    'video/mp4';

        return URL.createObjectURL(blobDataToBlob(data, mimeType));
    } catch (err: any) {
        throw new Error(err.message || String(err));
    }
};

// Helper for large data
const blobDataToBlob = (data: any, mimeType: string) => {
    return new Blob([data.buffer ? data.buffer : data], { type: mimeType });
};
