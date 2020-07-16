
section .bss
	dummy: resb 5
	time: resb 8




section .text

global rand

somecode:
	xor eax, eax
	xor eax, eax

rand:
	; get time
	mov eax, 13
	mov ebx, time
	int 80h

	mov eax, [time]
	ret