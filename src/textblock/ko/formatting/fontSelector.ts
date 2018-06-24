import template from "./fontSelector.html";
import { IHtmlEditorProvider } from "@paperbits/common/editing";
import { Component } from "../../../ko/component";

@Component({
    selector: "font-selector",
    template: template,
    injectable: "fontSelector"
})
export class FontSelector {
    constructor(
        private readonly htmlEditorProvider: IHtmlEditorProvider
    ) { }

    public serif(): void {
        this.htmlEditorProvider.getCurrentHtmlEditor().setTypegraphy("serif");
    }

    public display(): void {
        this.htmlEditorProvider.getCurrentHtmlEditor().setTypegraphy("display");
    }
}