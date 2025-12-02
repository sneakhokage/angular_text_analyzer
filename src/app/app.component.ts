import { Component } from '@angular/core';

interface WordFrequency {
    word: string;
    count: number;
}

interface TextStats {
    wordCount: number;
    charCount: number;
    charCountNoSpaces: number;
    sentenceCount: number;
    readability: string;
    topWords: WordFrequency[];
    readingTime: number;
    wordProgress: number;
    charProgress: number;
    sentenceProgress: number;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    isDarkTheme: boolean = false;
    isCompareMode: boolean = false;

    text: string = '';
    text2: string = '';

    stats1: TextStats = this.getEmptyStats();
    stats2: TextStats = this.getEmptyStats();

    ngOnInit(): void {
        const savedTheme = localStorage.getItem('theme');
        this.isDarkTheme = savedTheme === 'dark';
    }

    toggleTheme(): void {
        this.isDarkTheme = !this.isDarkTheme;
        localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    }

    toggleCompareMode(): void {
        this.isCompareMode = !this.isCompareMode;
        if (!this.isCompareMode) {
            this.text2 = '';
            this.stats2 = this.getEmptyStats();
        }
    }

    analyzeText1(): void {
        this.stats1 = this.analyze(this.text);
    }

    analyzeText2(): void {
        this.stats2 = this.analyze(this.text2);
    }

    private analyze(text: string): TextStats {
        if (!text.trim()) {
            return this.getEmptyStats();
        }

        const wordCount = this.countWords(text);
        const charCount = text.length;
        const charCountNoSpaces = text.replace(/\s/g, '').length;
        const sentenceCount = this.countSentences(text);
        const readability = this.calculateReadability(wordCount, charCountNoSpaces, sentenceCount);
        const topWords = this.getTopWords(text);
        const readingTime = this.calculateReadingTime(wordCount);
        const wordProgress = Math.min((wordCount / 500) * 100, 100);
        const charProgress = Math.min((charCount / 3000) * 100, 100);
        const sentenceProgress = Math.min((sentenceCount / 30) * 100, 100);

        return {
            wordCount,
            charCount,
            charCountNoSpaces,
            sentenceCount,
            readability,
            topWords,
            readingTime,
            wordProgress,
            charProgress,
            sentenceProgress
        };
    }

    private countWords(text: string): number {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    private countSentences(text: string): number {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return sentences.length;
    }

    private calculateReadability(wordCount: number, charCountNoSpaces: number, sentenceCount: number): string {
        if (wordCount === 0 || sentenceCount === 0) return 'Невідомо';

        const avgWordsPerSentence = wordCount / sentenceCount;
        const avgCharsPerWord = charCountNoSpaces / wordCount;

        if (avgWordsPerSentence < 15 && avgCharsPerWord < 5) {
            return 'Легко';
        } else if (avgWordsPerSentence < 20 && avgCharsPerWord < 6) {
            return 'Середньо';
        } else {
            return 'Складно';
        }
    }

    private getTopWords(text: string): WordFrequency[] {
        const words = text.toLowerCase()
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

    private calculateReadingTime(wordCount: number): number {
        const wordsPerMinute = 200;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    private getEmptyStats(): TextStats {
        return {
            wordCount: 0,
            charCount: 0,
            charCountNoSpaces: 0,
            sentenceCount: 0,
            readability: '',
            topWords: [],
            readingTime: 0,
            wordProgress: 0,
            charProgress: 0,
            sentenceProgress: 0
        };
    }

    clearText(): void {
        this.text = '';
        this.stats1 = this.getEmptyStats();
    }

    clearText2(): void {
        this.text2 = '';
        this.stats2 = this.getEmptyStats();
    }

    downloadText(): void {
        if (!this.text.trim()) return;

        const blob = new Blob([this.text], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'text-analyzer-export.txt';
        link.click();
        window.URL.revokeObjectURL(url);
    }

    removeParagraphs(): void {
        this.text = this.text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
        this.analyzeText1();
    }

    removeParagraphs2(): void {
        this.text2 = this.text2.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
        this.analyzeText2();
    }

    getDifference(val1: number, val2: number): string {
        const diff = val1 - val2;
        if (diff === 0) return '0';
        return diff > 0 ? `+${diff}` : `${diff}`;
    }

    getDifferenceClass(val1: number, val2: number): string {
        const diff = val1 - val2;
        if (diff === 0) return 'neutral';
        return diff > 0 ? 'positive' : 'negative';
    }
}