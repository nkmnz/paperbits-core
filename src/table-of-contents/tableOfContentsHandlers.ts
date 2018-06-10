﻿import { IWidgetOrder } from '@paperbits/common/editing';
import { IWidgetHandler } from '@paperbits/common/editing';
import { IViewManager } from "@paperbits/common/ui/IViewManager";
import { TableOfContentsModelBinder } from './tableOfContentsModelBinder';

export class TableOfContentsHandlers implements IWidgetHandler {
    private readonly viewManager: IViewManager;
    private readonly modelBinder: TableOfContentsModelBinder;

    constructor(tableOfContentsModelBinder: TableOfContentsModelBinder, viewManager: IViewManager) {
        this.viewManager = viewManager;
        this.modelBinder = tableOfContentsModelBinder;
    }

    private async getWidgetOrderByConfig(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "table-of-contents",
            displayName: "Table of contents",
            iconClass: "paperbits-cheque-3",
            createModel: async () => {
                const config = {
                    object: "block",
                    type: "table-of-contents",
                    title: "Table of contents"
                };

                return await this.modelBinder.nodeToModel(config);
            }
        }

        return widgetOrder;
    }

    public getWidgetOrder(): Promise<IWidgetOrder> {
        return Promise.resolve(this.getWidgetOrderByConfig());
    }
}