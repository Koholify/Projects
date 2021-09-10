#ifndef _ARRAY_LIST_H
#define _ARRAYLIST_H

#include <stdlib.h>
#include <string.h>
#include <stdio.h>

typedef enum {
    LIST_INT,
    LIST_CHAR,
    LIST_FLOAT,
} ListType;

typedef struct ArrayList {
    ListType type;
    size_t size;
    void* data;
    size_t capacity;
} ArrayList;

size_t ArrayList_GetDataSize(ListType type);
ArrayList* ArrayList_Create(size_t capacity, ListType type);
void ArrayList_Add(ArrayList* list, void* item);
void ArrayList_Insert(ArrayList* list, void* item, size_t index);
void ArrayList_RemoveAt(ArrayList* list, size_t index);
void ArrayList_Pop(ArrayList* list); 
void ArrayList_HalfSize(ArrayList* list);
void ArrayList_Free(ArrayList** list);

void* ArrayList_Get(ArrayList* list, size_t index);
size_t ArrayList_Length(ArrayList* list);
size_t ArrayList_Capacity(ArrayList* list);
void ArrayList_Clear(ArrayList* list);
int ArrayList_IsEmpty(ArrayList* list);

#endif