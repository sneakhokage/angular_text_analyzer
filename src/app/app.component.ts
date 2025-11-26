import { Component } from '@angular/core';

interface WordFrequency {
    word: string;
    count: number;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    text: string = '';
    wordCount: number = 0;
    charCount: number = 0;
    charCountNoSpaces: number = 0;
    sentenceCount: number = 0;
    readability: string = '';
    topWords: WordFrequency[] = [];

    wordProgress: number = 0;
    charProgress: number = 0;
    sentenceProgress: number = 0;

    analyzeText(): void {
        if (!this.text.trim()) {
            this.resetStats();
            return;
        }

        this.wordCount = this.countWords();
        this.charCount = this.text.length;
        this.charCountNoSpaces = this.text.replace(/\s/g, '').length;
        this.sentenceCount = this.countSentences();
        this.readability = this.calculateReadability();
        this.topWords = this.getTopWords();
        this.calculateProgress();
    }

    private countWords(): number {
        return this.text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    private countSentences(): number {
        const sentences = this.text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return sentences.length;
    }

    private calculateReadability(): string {
        if (this.wordCount === 0 || this.sentenceCount === 0) return 'Невідомо';

        const avgWordsPerSentence = this.wordCount / this.sentenceCount;
        const avgCharsPerWord = this.charCountNoSpaces / this.wordCount;

        if (avgWordsPerSentence < 15 && avgCharsPerWord < 5) {
            return 'Легко';
        } else if (avgWordsPerSentence < 20 && avgCharsPerWord < 6) {
            return 'Середньо';
        } else {
            return 'Складно';
        }
    }

    private getTopWords(): WordFrequency[] {
        const words = this.text.toLowerCase()
            .replace(/[^\wа-яієїґ\s]/gi, '')
            .split(/\s+/)
            .filter(word => word.length > 2);

        const frequency: { [key: string]: number } = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        return Object.entries(frequency)
            .map(([word, count]) => ({ word, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    private calculateProgress(): void {
        this.wordProgress = Math.min((this.wordCount / 500) * 100, 100);
        this.charProgress = Math.min((this.charCount / 3000) * 100, 100);
        this.sentenceProgress = Math.min((this.sentenceCount / 30) * 100, 100);
    }

    private resetStats(): void {
        this.wordCount = 0;
        this.charCount = 0;
        this.charCountNoSpaces = 0;
        this.sentenceCount = 0;
        this.readability = '';
        this.topWords = [];
        this.wordProgress = 0;
        this.charProgress = 0;
        this.sentenceProgress = 0;
    }

    clearText(): void {
        this.text = '';
        this.resetStats();
    }
}