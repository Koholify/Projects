#include "ArrayList.h"

static void DoubleArraySize(ArrayList* list){
    int newCapacity = 2 * list->capacity;
    size_t dataSize = ArrayList_GetDataSize(list->type);
    void *newList = malloc(dataSize * newCapacity);
    if (!newList) {
        printf("Not enough memory!!\n");
        abort();
    }

    memcpy(newList, list->data, list->size * dataSize);

    free(list->data);
    list->data = newList;
    list->capacity = newCapacity;
}

void ArrayList_HalfSize(ArrayList* list){
    int newCapacity = list->capacity / 2;
    size_t dataSize = ArrayList_GetDataSize(list->type);
    void *newList = malloc(dataSize * newCapacity);
    if(!newList) {
        printf("Not enough memory!!\n");
        abort();
    }

    memcpy(newList, list->data, newCapacity * dataSize);

    free(list->data);
    list->data = newList;
    list->capacity = newCapacity;
}

size_t ArrayList_GetDataSize(ListType type) {
    switch (type) {
        case LIST_INT: return sizeof(int);
        case LIST_CHAR: return sizeof(char);
        case LIST_FLOAT: return sizeof(float);
        default: return 0;
    }
}

ArrayList* ArrayList_Create(size_t capacity, ListType type) {    
    ArrayList* newList = malloc(sizeof(ArrayList));
    if (newList == NULL) {
        printf("Not Enough Memory available\n");
        abort();
    }

    newList->capacity = capacity;
    newList->size = 0;
    newList->type = type;
    newList->data = malloc(ArrayList_GetDataSize(type) * capacity);
    if(newList->data == NULL) {
        printf("Not Enough Memory available\n");
        free(newList);
        abort();
    }

    return newList;
}

void ArrayList_Free(ArrayList** list) {
    free((*list)->data);
    free(*list);
    (*list) = NULL;
}

void* ArrayList_Get(ArrayList* list, size_t index) {
    return (void*)(((char*)list->data) + (index * ArrayList_GetDataSize(list->type)));
}

size_t ArrayList_Length(ArrayList* list) {
    return list->size;
}

size_t ArrayList_Capacity(ArrayList* list) {
    return list->capacity;
}

void ArrayList_Clear(ArrayList* list) {
    free(list->data);
    list->size = 0;
    list->data = malloc(ArrayList_GetDataSize(list->type) * list->capacity);
    if(!list->data) {
        printf("Not enough memory!!\n");
        abort();
    }
}

int ArrayList_IsEmpty(ArrayList* list) {
    return list->size == 0 ? 1 : 0;
}

void ArrayList_Add(ArrayList* list, void* item) {
    size_t dataSize = ArrayList_GetDataSize(list->type);

    if(list->size >= list->capacity)
    {
        DoubleArraySize(list);
    }

    memcpy(
        ArrayList_Get(list, list->size), 
        item, 
        dataSize
    );
    list->size++;
}

void ArrayList_Insert(ArrayList* list, void* item, size_t index) {
    size_t dataSize = ArrayList_GetDataSize(list->type);

    if(list->size >= list->capacity) {
        DoubleArraySize(list);
    }   

    for(size_t i = list->size; i > index; i--) {
        memcpy(ArrayList_Get(list, i), ArrayList_Get(list, i-1), dataSize);
    }

    memcpy(ArrayList_Get(list, index), item, dataSize);
    list->size++;
}

void ArrayList_RemoveAt(ArrayList* list, size_t index) {
    size_t dataSize = ArrayList_GetDataSize(list->type);
    for(size_t i = index; i < list->size; i++) {
        memcpy(ArrayList_Get(list, i), ArrayList_Get(list, i+1), dataSize);
    }

    void* empty = malloc(dataSize);
    memcpy(ArrayList_Get(list, list->size-1), empty, dataSize);
    free(empty);
    list->size--;
}

void ArrayList_Pop(ArrayList* list) {
    ArrayList_RemoveAt(list, list->size - 1);
}