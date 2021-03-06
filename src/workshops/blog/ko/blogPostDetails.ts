﻿import template from "./blogPostDetails.html";
import { IBlogService } from "@paperbits/common/blogs";
import { Router } from "@paperbits/common/routing";
import { ViewManager } from "@paperbits/common/ui";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { BlogPostItem } from "./blogPostItem";

@Component({
    selector: "blog-post-details-workshop",
    template: template
})
export class BlogPostDetailsWorkshop {
    @Param()
    public readonly blogPostItem: BlogPostItem;

    @Event()
    public readonly onDeleteCallback: () => void;

    constructor(
        private readonly blogService: IBlogService,
        private readonly router: Router,
        private readonly viewManager: ViewManager
    ) {
        // rebinding...
        this.onMounted = this.onMounted.bind(this);
        this.deleteBlogPost = this.deleteBlogPost.bind(this);
        this.updateBlogPost = this.updateBlogPost.bind(this);
        this.updatePermlaink = this.updatePermlaink.bind(this);
    }

    @OnMounted()
    public async onMounted(): Promise<void> {
        this.blogPostItem.title
            .extend(<any>{ required: true })
            .subscribe(this.updateBlogPost);

        this.blogPostItem.description
            .subscribe(this.updateBlogPost);

        this.blogPostItem.keywords
            .subscribe(this.updateBlogPost);

        this.blogPostItem.permalink
            .extend(<any>{ validPermalink: this.blogPostItem.permalink, required: true, onlyValid: true })
            .subscribe(this.updatePermlaink);

        const blogPost = await this.blogService.getBlogPostByKey(this.blogPostItem.key);

        this.blogPostItem.permalink(blogPost.permalink);
        this.router.navigateTo(blogPost.permalink, blogPost.title);
    }

    private async updateBlogPost(): Promise<void> {
        if ((<any>this.blogPostItem.title).isValid()) {
            await this.blogService.updateBlogPost(this.blogPostItem.toBlogPost());
        }
    }

    private async updatePermlaink(): Promise<void> {
        const permalink = this.blogPostItem.permalink();
        this.router.notifyListeners = false;
        // this.router.navigateTo(permalink);
        this.router.notifyListeners = true;

        this.updateBlogPost();
    }

    public async deleteBlogPost(): Promise<void> {
        // TODO: Show confirmation dialog according to mockup
        await this.blogService.deleteBlogPost(this.blogPostItem.toBlogPost());

        this.viewManager.notifySuccess("Blog", `Post "${this.blogPostItem.title()}" was deleted.`);
        this.viewManager.closeWorkshop("blog-post-details-workshop");

        if (this.onDeleteCallback) {
            this.onDeleteCallback();
        }

        this.router.navigateTo("/");
    }
}