
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>

typedef uint64_t Elf64_Addr;
typedef uint64_t Elf64_Off;
typedef uint16_t Elf64_Half;
typedef uint32_t Elf64_Word;
typedef int32_t Elf64_Sword;
typedef uint64_t Elf64_Xword;
typedef int64_t Elf64_Sxword;

typedef struct {
	unsigned char e_ident[16]; /* ELF identification */
	Elf64_Half e_type; /* Object file type */
	Elf64_Half e_machine; /* Machine type */
	Elf64_Word e_version; /* Object file version */
	Elf64_Addr e_entry; /* Entry point address */
	Elf64_Off e_phoff; /* Program header offset */
	Elf64_Off e_shoff; /* Section header offset */
	Elf64_Word e_flags; /* Processor-specific flags */
	Elf64_Half e_ehsize; /* ELF header size */
	Elf64_Half e_phentsize; /* Size of program header entry */
	Elf64_Half e_phnum; /* Number of program header entries */
	Elf64_Half e_shentsize; /* Size of section header entry */
	Elf64_Half e_shnum; /* Number of section header entries */
	Elf64_Half e_shstrndx; /* Section name string table index */
} Elf64_Ehdr;

#define EI_MAG0 0
#define EI_MAG1 1
#define EI_MAG2 2
#define EI_MAG3 3
#define EI_CLASS 4
#define EI_DATA 5
#define EI_VERSION 6
#define EI_OSABI 7
#define EI_ABIVERSION 8
#define EI_PAD 9
#define EI_NIDENT 16

#define ET_NONE 0
#define ET_REL 1
#define ET_EXEC 2
#define ET_DYN 3
#define ET_CORE 4

typedef struct {
	Elf64_Word p_type; /* Type of segment */
	Elf64_Word p_flags; /* Segment attributes */
	Elf64_Off p_offset; /* Offset in file */
	Elf64_Addr p_vaddr; /* Virtual address in memory */
	Elf64_Addr p_paddr; /* Reserved */
	Elf64_Xword p_filesz; /* Size of segment in file */
	Elf64_Xword p_memsz; /* Size of segment in memory */
	Elf64_Xword p_align; /* Alignment of segment */
} Elf64_Phdr;

#define PT_NULL 0
#define PT_LOAD 1
#define PT_DYNAMIC 2
#define PT_INTERP 3
#define PT_NOTE 4
#define PT_SHLIB 5
#define PT_PHDR 6

#define PF_X 1
#define PF_W 2
#define PF_R 4



typedef struct {
	Elf64_Word sh_name; /* Section name */
	Elf64_Word sh_type; /* Section type */
	Elf64_Xword sh_flags; /* Section attributes */
	Elf64_Addr sh_addr; /* Virtual address in memory */
	Elf64_Off sh_offset; /* Offset in file */
	Elf64_Xword sh_size; /* Size of section */
	Elf64_Word sh_link; /* Link to other section */
	Elf64_Word sh_info; /* Miscellaneous information */
	Elf64_Xword sh_addralign; /* Address alignment boundary */
	Elf64_Xword sh_entsize; /* Size of entries, if section has table */
} Elf64_Shdr;

#define SHT_NULL 0
#define SHT_PROGBITS 1
#define SHT_SYMTAB 2
#define SHT_STRTAB 3
#define SHT_RELA 4
#define SHT_HASH 5
#define SHT_DYNAMIC 6
#define SHT_NOTE 7
#define SHT_NOBITS 8
#define SHT_REL 9
#define SHT_SHLIB 10
#define SHT_DYNSYM 11

#define SHF_WRITE 1
#define SHF_ALLOC 2
#define SHF_EXECINSTR 4

typedef struct {
	Elf64_Word st_name; /* Symbol name */
	unsigned char st_info; /* Type and Binding attributes */
	unsigned char st_other; /* Reserved */
	Elf64_Half st_shndx; /* Section table index */
	Elf64_Addr st_value; /* Symbol value */
	Elf64_Xword st_size; /* Size of object (e.g., common) */
} Elf64_Sym;

#define STB_LOCAL 0
#define STB_GLOBAL 1
#define STB_WEAK 2

#define STT_NOTYPE 0
#define STT_OBJECT 1
#define STT_FUNC 2
#define STT_SECTION 3
#define STT_FILE 4

typedef struct {
	Elf64_Addr r_offset; /* Address of reference */
	Elf64_Xword r_info; /* Symbol index and type of relocation */
} Elf64_Rel;

typedef struct {
	Elf64_Addr r_offset; /* Address of reference */
	Elf64_Xword r_info; /* Symbol index and type of relocation */
	Elf64_Sxword r_addend; /* Constant part of expression */
} Elf64_Rela;

#define ELF64_R_SYM(i)((i) >> 32)
#define ELF64_R_TYPE(i)((i) & 0xffffffffL)
#define ELF64_R_INFO(s, t)(((s) << 32) + ((t) & 0xffffffffL))

char nFiles;
FILE **input_files;
char **input;
long *input_size;
Elf64_Phdr output_phdr[100];
Elf64_Shdr output_shdr[1000];
int n_phdr = 0;
int n_shdr = 0;


int main( int argc, char **argv)
{
	if (argc < 2) {
		puts("Error: no files specified");
		puts("Usage: klinker file1, file2, file3...");
		exit(-1);
	}

	char nFiles = argc-1;
	FILE **input_files = malloc( sizeof(FILE*) * nFiles );
	char **input = malloc( sizeof(char*) * nFiles );
	long *input_size = malloc( sizeof(long) * nFiles );

	for (int i = 0; i< nFiles; i++) {
		input_files[i] = fopen(argv[i+1], "rb");

		if ( input_files[i] == NULL ) {
			printf("Error: can\'t open %s\n", argv[i+1]);
			exit(-2);
		}

		int err_code = fseek(input_files[i], 0L, SEEK_END);
		if ( err_code ) {
			printf("Error: cant go to the end of file %s\n", argv[i+1]);
			exit(-3);
		}

		input_size[i] = ftell( input_files[i] );
		if ( input_size[i] < 0 ) {
			printf("Error: cant get the length of file %s\n", argv[i+1] );
			exit(-4);
		}

		input[i] = malloc( input_size[i] );

		err_code = fseek(input_files[i], 0L, SEEK_SET);
		if ( err_code ) {
			printf("Error: cant go to the start of file %s\n", argv[i+1]);
			exit(-5);
		}

		size_t newLen = fread(input[i], sizeof(char), input_size[i], input_files[i]);
		err_code = ferror( input_files[i] );
		if ( err_code ) {
			printf("Error: cant read file %s into memory\n", argv[i+1]);
			exit(-6);
		}

		if ( newLen != input_size[i] ) {
			printf("Error: sizes of file %s dont match: %d, %d\n", argv[i+1], input_size[i], newLen);
			exit(-7);
		}

		fclose( input_files[i] );
	}

	// loop thru all ehdr, see if all elf64, x86-64
	for (int i = 0; i<nFiles; i++) {
		Elf64_Ehdr *file = input[i];

		if ( file->e_ident[EI_MAG0] != 0x7f ||
			file->e_ident[EI_MAG1] != 'E' ||
			file->e_ident[EI_MAG2] != 'L' ||
			file->e_ident[EI_MAG3] != 'F'
		) {
			printf("Error: %s is not a valid ELF file", argv[i+1]);
			exit(-8);
		}

		if ( file->e_ident[EI_CLASS] != 2) {
			printf("Error: This linker supports only 64 bit object files. %s is not 64 bit", argv[i+1]);
			exit(-9);
		}

		if ( file->e_ident[EI_DATA] != 1) {
			printf("Error: This linker supports only little endian object files. %s is not little endian", argv[i+1]);
			exit(-10);
		}

		if ( file->e_type != 1) {
			printf("Error: This linker supports only relocatable object files. %s is not relocatable", argv[i+1]);
			exit(-11);
		}
	}

	// we increase this as we populate output arrays
	long current_vaddr = 0;

	// for all flag combinations
	for (int i = 0; i<8; i++) {

		// create phdr
		Elf64_Phdr *new_phdr = &output_phdr[ n_phdr++ ];
		new_phdr->p_type = PT_LOAD;
		new_phdr->p_flags = i;
		new_phdr->p_vaddr = current_vaddr;
		new_phdr->p_paddr = current_vaddr;
		new_phdr->p_offset = current_vaddr; // this will be modified by current_vaddr + base_vaddr
		// NOTE: dont forget to fill in offset, filesz, memsz, alignment

		// loop thru all files
		for (int j = 0; j<nFiles; j++) {

			Elf64_Ehdr *file = input[j];
			Elf64_Shdr *shdr_tbl = input[j] + file->e_shoff;

			// for all sections (skip first one)
			for (int k = 1; k< file->e_shnum; k++) {
				Elf64_Shdr *shdr = (char*)shdr_tbl + k*file->e_shentsize;

				if (shdr->sh_flags != i) continue;
				if (shdr->sh_type != SHT_PROGBITS) continue;

				// create shdr
				Elf64_Shdr *new_shdr = &output_shdr[ n_shdr++ ];
				new_shdr->sh_type = SHT_PROGBITS;
				new_shdr->sh_flags = i;
				new_shdr->sh_addr = current_vaddr;
				new_shdr->sh_offset = current_vaddr;
				new_shdr->sh_size = shdr->sh_size;
				new_shdr->sh_link = shdr->sh_link;
				new_shdr->sh_info = shdr->sh_info;
				new_shdr->sh_entsize = shdr->sh_entsize;
				
				


			}
		}

	}
		
	// check their flags and types, fill in output arrays
	/// relocations...
	// symtabs
	// put into file


	return 0;
}