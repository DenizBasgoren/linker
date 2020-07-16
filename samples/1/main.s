

section .text

global return
return:  
    mov eax, 1
    mov ebx, 0
a_symbol:
    int 80h