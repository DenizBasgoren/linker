#!/bin/bash

# main.s
nasm -f elf32 ./main.s -o main32.o

# lib.s
nasm -f elf32 ./lib.s -o lib32.o

# link
ld -m elf_i386 ./main32.o ./lib32.o -o main32 -e baslangic
