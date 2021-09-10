#include <stdio.h>
#include <stdlib.h>
#include "ArrayList.h"

int main(int argc, char* args[])
{
    ArrayList* intList = ArrayList_Create(10, LIST_INT);
    for(int i = 0; i < 17; i++) {
        int n = i * i;
        ArrayList_Add(intList, &n);
    }

    for(int k = 0; k < (int)intList->size; k++) {
        printf("Item %d: %d\n", k, *(int*)ArrayList_Get(intList, k));
    }
    printf("\n");

    ArrayList_RemoveAt(intList, 3);
    ArrayList_Pop(intList);

    for(int k = 0; k < (int)intList->size; k++) {
        printf("Item %d: %d\n", k, *(int*)ArrayList_Get(intList, k));
    }

    printf("\nLength of list: %ld\n", ArrayList_Length(intList));
    printf("Capacity: %ld", ArrayList_Capacity(intList));
    ArrayList_Clear(intList);

    printf("\nClearing...\nLength of list: %ld\n", ArrayList_Length(intList));
    ArrayList_Free(&intList);
} 