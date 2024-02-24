package com.brhn.xpnsr.config;

import com.brhn.xpnsr.apis.CategoryApi;
import com.brhn.xpnsr.apis.UserApi;
import com.brhn.xpnsr.exceptions.NotFoundError;
import com.brhn.xpnsr.models.Category;
import com.brhn.xpnsr.services.dtos.CategoryDTO;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.RepresentationModelAssembler;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

//@Component
//public class YourEntityModelAssembler implements RepresentationModelAssembler<Category, EntityModel<Category>> {
//
//    @Override
//    public EntityModel<Category> toModel(Category entity) {
//        try {
//            return EntityModel.of(entity,
//                    linkTo(methodOn(CategoryApi.class).getCategoryById(entity.getId())).withSelfRel(),
//                    linkTo(methodOn(UserApi.class)).withRel("entities"));
//        } catch (NotFoundError e) {
//            // do nothing
//        }
//    }
//
//    @Override
//    public CollectionModel<EntityModel<Category>> toCollectionModel(Iterable<? extends Category> entities) {
//        return RepresentationModelAssembler.super.toCollectionModel(entities)
//                .add(linkTo(methodOn(CategoryApi.class).getAllCategories()).withSelfRel());
//    }
//}