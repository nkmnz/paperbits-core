import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import { IBlogService, BlogPostContract } from "@paperbits/common/blogs";
import { IPublisher } from "@paperbits/common/publishing";
import { IBlobStorage } from "@paperbits/common/persistence";
import { SettingsContract, ISiteService } from "@paperbits/common/sites";
import { IMediaService, MediaContract } from "@paperbits/common/media";
import { LayoutViewModelBinder } from "../layout/ko";
import { ISettingsProvider } from "@paperbits/common/configuration";

export class BlogPublisher implements IPublisher {
    constructor(
        private readonly blogService: IBlogService,
        private readonly siteService: ISiteService,
        private readonly outputBlobStorage: IBlobStorage,
        private readonly layoutViewModelBinder: LayoutViewModelBinder,
        private readonly mediaService: IMediaService
    ) {
        this.publish = this.publish.bind(this);
        this.renderBlogPost = this.renderBlogPost.bind(this);
    }

    private async renderBlogPost(post: BlogPostContract, settings: SettingsContract, iconFile: MediaContract): Promise<{ name, bytes }> {
        console.log(`Publishing blog post ${post.title}...`);
        const templateDocument = null; // createDocument(template);

        let resourceUri: string;
        let htmlContent: string;

        const buildContentPromise = new Promise(async (resolve, reject) => {
            const layoutViewModel = await this.layoutViewModelBinder.getLayoutViewModel(post.permalink, null);
            ko.applyBindingsToNode(templateDocument.body, { widget: layoutViewModel }, null);

            setTimeout(() => {
                htmlContent = "<!DOCTYPE html>" + templateDocument.documentElement.outerHTML;
                resolve();
            }, 500);
        });

        await buildContentPromise;

        const contentBytes = Utils.stringToUnit8Array(htmlContent);

        if (!resourceUri || resourceUri === "/blog") {
            resourceUri = "/blog/index.html";
        }
        else {
            // if filename has no extension we publish it to a dedicated folder with index.html
            if (!resourceUri.substr((~-resourceUri.lastIndexOf(".") >>> 0) + 2)) {
                resourceUri = `/${resourceUri}/index.html`;
            }
        }

        return { name: resourceUri, bytes: contentBytes };
    }

    public async publish(): Promise<void> {
        const posts = await this.blogService.search("");
        const results = [];
        const settings = await this.siteService.getSiteSettings();

        let iconFile;

        if (settings && settings.site.faviconSourceKey) {
            iconFile = await this.mediaService.getMediaByKey(settings.site.faviconSourceKey);
        }

        const renderAndUpload = async (post): Promise<void> => {
            const pageRenderResult = await this.renderBlogPost(post, settings, iconFile);
            await this.outputBlobStorage.uploadBlob(pageRenderResult.name, pageRenderResult.bytes, "text/html");
        };

        for (const post of posts) {
            results.push(renderAndUpload(post));
        }

        await Promise.all(results);
    }
}
