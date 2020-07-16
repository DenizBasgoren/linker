global baslangic


section .bss
isim: resb 10
soyisim: resb 10

section .data
isim_ne: db "isim ne?"
soyisim_ne: db "soyisim ne?"
hosgeldiniz: db "hosgeldiniz, "

section .text
baslangic:

; print isim ne?
	mov eax, 4
    mov ebx, 1
    mov ecx, isim_ne
    mov edx, 8
    int 80h

; scan isim
	mov eax, 3
    mov ebx, 0
    mov ecx, isim
    mov edx, 10
    int 80h

; print soyisim ne?
	mov eax, 4
    mov ebx, 1
    mov ecx, soyisim_ne
    mov edx, 11
    int 80h

; scan soyisim
	mov eax, 3
    mov ebx, 0
    mov ecx, soyisim
    mov edx, 10
    int 80h

; print hosgeldiniz
	mov eax, 4
    mov ebx, 1
    mov ecx, hosgeldiniz
    mov edx, 13
    int 80h

; print isim
	mov eax, 4
    mov ebx, 1
    mov ecx, isim
    mov edx, 10
    int 80h

; print soyisim
	mov eax, 4
    mov ebx, 1
    mov ecx, soyisim
    mov edx, 10
    int 80h

; exit
    mov eax, 1
    mov ebx, 0
    int 80h