#!/bin/bash

# main.s
nasm -f elf64 ./main.s -o main64.o

# lib.s
nasm -f elf64 ./lib.s -o lib64.o

# link
ld -m elf_x86_64 ./main64.o ./lib64.o -o main64 -e baslangic
