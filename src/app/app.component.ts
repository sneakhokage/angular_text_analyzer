import { Component } from '@angular/core';

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

    analyzeText(): void {
        if (!this.text.trim()) {
            this.resetStats();
            return;
        }

        this.wordCount = this.countWords();
        this.charCount = this.text.length;
        this.charCountNoSpaces = this.text.replace(/\s/g, '').length;
        this.sentenceCount = this.countSentences();
    }

    private countWords(): number {
        return this.text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    private countSentences(): number {
        const sentences = this.text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return sentences.length;
    }

    private resetStats(): void {
        this.wordCount = 0;
        this.charCount = 0;
        this.charCountNoSpaces = 0;
        this.sentenceCount = 0;
    }
}
