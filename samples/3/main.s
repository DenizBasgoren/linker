
global baslangic


section .data
deniz: db "Deniz"
helloworld: db "Hello world", 10


section .text

baslangic:

    ; print
    mov eax, 4
    mov ebx, 1
    mov ecx, helloworld
    mov edx, 12
    int 80h

return:  
    mov eax, 1
    mov ebx, 0
    int 80h