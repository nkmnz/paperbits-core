﻿import * as ko from "knockout";
import * as FileSaver from "file-saver";
import template from "./mediaDetails.html";
import { PermalinkContract, IPermalinkService } from "@paperbits/common/permalinks";
import { IMediaService } from "@paperbits/common/media";
import { IViewManager } from "@paperbits/common/ui";
import { MediaItem } from "./mediaItem";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";

@Component({
    selector: "media-details-workshop",
    template: template,
    injectable: "mediaDetailsWorkshop"
})
export class MediaDetailsWorkshop {
    private mediaPermalink: PermalinkContract;

    @Param()
    public readonly mediaItem: MediaItem;

    @Event()
    private readonly onDeleteCallback: () => void;

    constructor(
        private readonly mediaService: IMediaService,
        private readonly permalinkService: IPermalinkService,
        private readonly viewManager: IViewManager
    ) {
        // rebinding...
        this.onMounted = this.onMounted.bind(this);
        this.deleteMedia = this.deleteMedia.bind(this);
        this.updateMedia = this.updateMedia.bind(this);
        this.updatePermlaink = this.updatePermlaink.bind(this);
        this.openCropper = this.openCropper.bind(this);
    }

    @OnMounted()
    public async onMounted(): Promise<void> {
        this.mediaItem.fileName
            .extend({ required: true, onlyValid: true })
            .subscribe(this.updateMedia);

        this.mediaItem.description
            .subscribe(this.updateMedia);

        this.mediaItem.keywords
            .subscribe(this.updateMedia);

        this.mediaItem.permalinkUrl
            .extend({ uniquePermalink: this.mediaItem.permalinkKey, onlyValid: true })
            .subscribe(this.updatePermlaink);

        const permalink = await this.permalinkService.getPermalinkByKey(this.mediaItem.permalinkKey);

        this.mediaPermalink = permalink;
        this.mediaItem.permalinkUrl(permalink.uri);
    }

    private async updateMedia(): Promise<void> {
        await this.mediaService.updateMedia(this.mediaItem.toMedia());
    }

    private async updatePermlaink(): Promise<void> {
        await this.permalinkService.updatePermalink(this.mediaPermalink);
    }

    public async deleteMedia(): Promise<void> {
        // TODO: Show confirmation dialog according to mockup
        await this.mediaService.deleteMedia(this.mediaItem.toMedia());
        this.viewManager.notifySuccess("Media library", `File "${this.mediaItem.fileName()}" was deleted.`);
        this.viewManager.closeWorkshop("media-details-workshop");

        if (this.onDeleteCallback) {
            this.onDeleteCallback();
        }
    }

    public async downloadMedia(): Promise<void> {
        FileSaver.saveAs(this.mediaItem.downloadUrl(), this.mediaItem.fileName(), { type: this.mediaItem.contentType() });
    }

    public openCropper(): void {
        this.viewManager.openViewAsPopup({
            heading: "Edit picture",
            component: {
                name: "picture-cropper",
                params: { sourceUrl: this.mediaItem.downloadUrl() }
            },
            resize: "vertically horizontally"
        });
    }
}