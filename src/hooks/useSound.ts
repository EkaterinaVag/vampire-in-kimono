import { useCallback } from 'react'

class SoundManager {
    private static instance: SoundManager
    private sounds: Map<string, HTMLAudioElement> = new Map()

    static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager()
        }
        return SoundManager.instance
    }

    getSound(path: string): HTMLAudioElement {
        if (!this.sounds.has(path)) {
            this.sounds.set(path, new Audio(path))
        }
        return this.sounds.get(path)!
    }

    play(path: string, options?: { volume?: number; loop?: boolean }) {
        const audio = this.getSound(path)
        audio.pause()
        audio.currentTime = 0
        if (options?.volume !== undefined) {
            audio.volume = options.volume
        }
        if (options?.loop !== undefined) {
            audio.loop = options.loop
        }
        audio.play().catch(() => { })
    }
}

export function useSound(soundPath: string) {
    const soundManager = SoundManager.getInstance()

    const play = useCallback((options?: { volume?: number; loop?: boolean }) => {
        soundManager.play(soundPath, options)
    }, [soundPath])

    const stop = useCallback(() => {
        const audio = soundManager.getSound(soundPath)
        audio.pause()
        audio.currentTime = 0
    }, [soundPath])

    return { play, stop }
}