global baslangic

section .data
str1: db "hello"
str2: db "world"

section .text

baslangic:
    mov eax, 1
    mov ebx, 0
a_symbol:
    int 80h