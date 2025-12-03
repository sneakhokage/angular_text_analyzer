import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface WordFrequency {
    word: string;
    count: number;
}

interface HistoryItem {
    text: string;
    date: Date;
    preview: string;
    stats: TextStats;
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
export class AppComponent implements OnInit {
    isDarkTheme: boolean = false;
    isCompareMode: boolean = false;

    text: string = '';
    text2: string = '';
    textHistory: string[] = [];

    stats1: TextStats = this.getEmptyStats();
    stats2: TextStats = this.getEmptyStats();

    history: HistoryItem[] = [];

    readonly stopWords = [
        'і', 'й', 'та', 'або', 'але', 'а', 'на', 'під', 'за', 'у', 'в', 'до', 'для',
        'що', 'як', 'це', 'ми', 'ви', 'ти', 'я', 'він', 'вона', 'воно', 'вони',
        'від', 'по', 'над', 'про', 'чи', 'не', 'так', 'ні', 'ж', 'то', 'би',
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
        'with', 'is', 'are', 'was', 'were', 'be', 'been', 'this', 'that', 'it',
        'he', 'she', 'they', 'we', 'you', 'me', 'him', 'her', 'us', 'them', 'my',
        'your', 'his', 'their', 'our', 'from', 'by', 'as', 'if', 'when', 'then'
    ];

    private readonly ukToLatMap: { [key: string]: string } = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e',
        'є': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y',
        'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
        'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E',
        'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y',
        'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
        'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch',
        'Ш': 'Sh', 'Щ': 'Shch', 'Ь': '', 'Ю': 'Yu', 'Я': 'Ya'
    };

    ngOnInit(): void {
        const savedTheme = localStorage.getItem('theme');
        this.isDarkTheme = savedTheme === 'dark';

        this.loadHistory();
        const savedText = localStorage.getItem('currentText');
        if (savedText) {
            this.text = savedText;
            this.analyzeText1();
        }
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
        localStorage.setItem('currentText', this.text);
        this.stats1 = this.analyze(this.text);
    }

    analyzeText2(): void {
        this.stats2 = this.analyze(this.text2);
    }

    saveToHistory(): void {
        if (!this.text.trim()) return;

        const newItem: HistoryItem = {
            text: this.text,
            date: new Date(),
            preview: this.text.slice(0, 30) + '...',
            stats: { ...this.stats1 }
        };

        this.history.unshift(newItem);

        if (this.history.length > 5) {
            this.history.pop();
        }

        localStorage.setItem('analysisHistory', JSON.stringify(this.history));
    }

    loadHistoryItem(item: HistoryItem): void {
        this.saveState();
        this.text = item.text;
        this.analyzeText1();
    }

    deleteHistoryItem(index: number, event: Event): void {
        event.stopPropagation();
        this.history.splice(index, 1);
        localStorage.setItem('analysisHistory', JSON.stringify(this.history));
    }

    saveState(): void {
        this.textHistory.push(this.text);
    }

    undo(): void {
        if (this.textHistory.length > 0) {
            const previousState = this.textHistory.pop();
            if (previousState !== undefined) {
                this.text = previousState;
                this.analyzeText1();
            }
        }
    }

    transformUpperCase(): void {
        this.saveState();
        this.text = this.text.toUpperCase();
        this.analyzeText1();
    }

    transformLowerCase(): void {
        this.saveState();
        this.text = this.text.toLowerCase();
        this.analyzeText1();
    }

    transformTranslit(): void {
        this.saveState();
        this.text = this.text.split('').map(char => this.ukToLatMap[char] || char).join('');
        this.analyzeText1();
    }

    removeExtraSpaces(): void {
        this.saveState();
        this.text = this.text.replace(/\s+/g, ' ').trim();
        this.analyzeText1();
    }

    clearText(): void {
        this.saveState();
        this.text = '';
        localStorage.removeItem('currentText');
        this.stats1 = this.getEmptyStats();
    }

    clearText2(): void {
        this.text2 = '';
        this.stats2 = this.getEmptyStats();
    }

    removeParagraphs(): void {
        this.saveState();
        this.text = this.text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
        this.analyzeText1();
    }

    removeParagraphs2(): void {
        this.text2 = this.text2.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
        this.analyzeText2();
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

    downloadPdf(): void {
        const data = document.querySelector('.stats-grid') as HTMLElement;
        if (!data || !this.text.trim()) return;

        html2canvas(data, { scale: 2 }).then(canvas => {
            const imgWidth = 208;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const contentDataURL = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            pdf.setFontSize(18);
            pdf.text('Text Analysis Report', 105, 20, { align: 'center' });
            pdf.addImage(contentDataURL, 'PNG', 0, 30, imgWidth, imgHeight);
            pdf.save('text-analysis-report.pdf');
        });
    }

    private loadHistory(): void {
        const savedHistory = localStorage.getItem('analysisHistory');
        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
        }
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
            wordCount, charCount, charCountNoSpaces, sentenceCount,
            readability, topWords, readingTime,
            wordProgress, charProgress, sentenceProgress
        };
    }

    private countWords(text: string): number {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    private countSentences(text: string): number {
        return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    }

    private calculateReadability(wordCount: number, charCountNoSpaces: number, sentenceCount: number): string {
        if (wordCount === 0 || sentenceCount === 0) return 'Невідомо';
        const avgWordsPerSentence = wordCount / sentenceCount;
        const avgCharsPerWord = charCountNoSpaces / wordCount;

        if (avgWordsPerSentence < 15 && avgCharsPerWord < 5) return 'Легко';
        else if (avgWordsPerSentence < 20 && avgCharsPerWord < 6) return 'Середньо';
        else return 'Складно';
    }

    private getTopWords(text: string): WordFrequency[] {
        const words = text.toLowerCase()
            .replace(/[^\wа-яієїґa-zA-Z\s-]/gi, '')
            .split(/\s+/)
            .filter(word => word.length > 2)
            .filter(word => !this.stopWords.includes(word));

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
            wordCount: 0, charCount: 0, charCountNoSpaces: 0, sentenceCount: 0,
            readability: '', topWords: [], readingTime: 0,
            wordProgress: 0, charProgress: 0, sentenceProgress: 0
        };
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