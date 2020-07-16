#!/bin/bash

nasm -f elf32 ./main.s -o main32.o
nasm -f elf64 ./main.s -o main64.o
ld -m elf_i386 ./main32.o -o main32 -e return
ld -m elf_x86_64 ./main64.o -o main64 -e return