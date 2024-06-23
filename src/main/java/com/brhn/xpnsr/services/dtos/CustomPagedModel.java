package com.brhn.xpnsr.services.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedModel;

import java.util.Collection;

public class CustomPagedModel<T> extends PagedModel<EntityModel<T>> {

    public CustomPagedModel(Collection<EntityModel<T>> content, PageMetadata metadata) {
        super(content, metadata);
    }

    @JsonProperty("items")
    public Collection<EntityModel<T>> getItems() {
        return super.getContent();
    }

    // Override getContent to prevent _embedded from being serialized
    @Override
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    public Collection<EntityModel<T>> getContent() {
        return super.getContent();
    }

    public void addLinks(Iterable<Link> links) {
        links.forEach(this::add);
    }
}
