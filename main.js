

let fs = require('fs')
let process = require('process')

let l = console.log


/* KEEP IN MIND

This value marks an undefined, missing, irrelevant, or otherwise meaningless section reference.
For example, a symbol "defined" relative to section number SHN_UNDEF is an undefined symbol.
(elf32, pg23)

SHN_ABS: This value specifies absolute values for the corresponding reference. For example, symbols defined relative to section number SHN_ABS have absolute values and are not affected by relocation.
SHN_COMMON: Symbols defined relative to this section are common symbols, such as FORTRAN COMMON or unallocated C external variables.
(elf32, pg23)

*/


// Elf32_Addr		4 Unsigned program address 
// Elf32_Half		2 Unsigned medium integer 
// Elf32_Off		4 Unsigned file offset 
// Elf32_Sword		4 Signed large integer 
// Elf32_Word 		4 Unsigned large integer
// unsigned char	1 Unsigned small integer

// Elf64_Addr		8 Unsigned program address 
// Elf64_Off		8 Unsigned file offset 
// Elf64_Half		2 Unsigned medium integer 
// Elf64_Word		4 Unsigned integer 
// Elf64_Sword		4 Signed integer 
// Elf64_Xword		8 Unsigned long integer 
// Elf64_Sxword		8 Signed long integer
// unsigned char	1 Unsigned small integer


// typedef struct {
// 		unsigned char e_ident[16];	0
// 		Elf32_Half e_type;			16
// 		Elf32_Half e_machine;		18
// 		Elf32_Word e_version;		20
// 		Elf32_Addr e_entry;			24
// 		Elf32_Off e_phoff;			28
// 		Elf32_Off e_shoff;			32
// 		Elf32_Word e_flags;			36
// 		Elf32_Half e_ehsize;		40
// 		Elf32_Half e_phentsize;		42
// 		Elf32_Half e_phnum;			44
// 		Elf32_Half e_shentsize;		46
// 		Elf32_Half e_shnum;			48
// 		Elf32_Half e_shstrndx;		50
// } Elf32_Ehdr;					52 total


// typedef struct {
//		unsigned char e_ident[16]; 	0
// 		Elf64_Half e_type;			16
// 		Elf64_Half e_machine;		18
// 		Elf64_Word e_version;		20
// 		Elf64_Addr e_entry;			24
// 		Elf64_Off e_phoff;			32
// 		Elf64_Off e_shoff;			40
// 		Elf64_Word e_flags;			44
// 		Elf64_Half e_ehsize;		48
// 		Elf64_Half e_phentsize;		50
// 		Elf64_Half e_phnum;			52
// 		Elf64_Half e_shentsize;		54
// 		Elf64_Half e_shnum;			56
// 		Elf64_Half e_shstrndx;		58
// } Elf64_Ehdr;					60 total


// typedef struct {
// 		Elf32_Word sh_name;			0
// 		Elf32_Word sh_type;			4
// 		Elf32_Word sh_flags;		8
// 		Elf32_Addr sh_addr;			12
// 		Elf32_Off sh_offset;		16
// 		Elf32_Word sh_size;			20
// 		Elf32_Word sh_link;			24
// 		Elf32_Word sh_info;			28
// 		Elf32_Word sh_addralign;	32
// 		Elf32_Word sh_entsize;		36
// } Elf32_Shdr;					40 total


// typedef struct {					0
// 		Elf64_Word sh_name;			4
// 		Elf64_Word sh_type;			8
// 		Elf64_Xword sh_flags;		16
// 		Elf64_Addr sh_addr;			24
// 		Elf64_Off sh_offset;		32
// 		Elf64_Xword sh_size;		40
// 		Elf64_Word sh_link;			44
// 		Elf64_Word sh_info;			48
// 		Elf64_Xword sh_addralign;	56
// 		Elf64_Xword sh_entsize;		64
// } Elf64_Shdr;					72 total



//////////////////////////// COSMETICS
function succ(...a) {
	process.stdout.write(`\x1b[32m`)
	l(...a)
	process.stdout.write(`\x1b[39m`)
}

function bad(...a) {
	process.stdout.write(`\x1b[31m`)
	l(...a)
	process.stdout.write(`\x1b[39m`)
}



//////////////////////////// READ WRITE

function r(f, ofs, tp) { // polymorphism bad, if-else good
	if (f.c == 'elf32') {
		if (f.end == 'le') {
			if ( tp == 'a' ) return f.b.readUInt32LE(ofs)
			if ( tp == 'h' ) return f.b.readUInt16LE(ofs)
			if ( tp == 'o' ) return f.b.readUInt32LE(ofs)
			if ( tp == 'sw' ) return f.b.readInt32LE(ofs)
			if ( tp == 'w' ) return f.b.readUInt32LE(ofs)
		} else {
			if ( tp == 'a' ) return f.b.readUInt32BE(ofs)
			if ( tp == 'h' ) return f.b.readUInt16BE(ofs)
			if ( tp == 'o' ) return f.b.readUInt32BE(ofs)
			if ( tp == 'sw' ) return f.b.readInt32BE(ofs)
			if ( tp == 'w' ) return f.b.readUInt32BE(ofs)
		}
	} else if (f.c == 'elf64') {
		if (f.end == 'le') {
			if ( tp == 'a' ) return f.b.readBigUInt64LE(ofs)
			if ( tp == 'h' ) return f.b.readUInt16LE(ofs)
			if ( tp == 'o' ) return f.b.readBigUInt64LE(ofs)
			if ( tp == 'sw' ) return f.b.readInt32LE(ofs)
			if ( tp == 'w' ) return f.b.readUInt32LE(ofs)
			if ( tp == 'sxw' ) return f.b.readBigInt64LE(ofs)
			if ( tp == 'xw' ) return f.b.readBigUInt64LE(ofs)
		} else {
			if ( tp == 'a' ) return f.b.readBigUInt64BE(ofs)
			if ( tp == 'h' ) return f.b.readUInt16BE(ofs)
			if ( tp == 'o' ) return f.b.readBigUInt64BE(ofs)
			if ( tp == 'sw' ) return f.b.readInt32BE(ofs)
			if ( tp == 'w' ) return f.b.readUInt32BE(ofs)
			if ( tp == 'sxw' ) return f.b.readBigInt64BE(ofs)
			if ( tp == 'xw' ) return f.b.readBigUInt64BE(ofs)
		}
	}
}

function w(f, ofs, tp, data) {
	if (f.c == 'elf32') {
		if (f.end == 'le') {
			if ( tp == 'a' ) return f.b.writeUInt32LE(data, ofs)
			if ( tp == 'h' ) return f.b.writeUInt16LE(data, ofs)
			if ( tp == 'o' ) return f.b.writeUInt32LE(data, ofs)
			if ( tp == 'sw' ) return f.b.writeInt32LE(data, ofs)
			if ( tp == 'w' ) return f.b.writeUInt32LE(data, ofs)
		} else {
			if ( tp == 'a' ) return f.b.writeUInt32BE(data, ofs)
			if ( tp == 'h' ) return f.b.writeUInt16BE(data, ofs)
			if ( tp == 'o' ) return f.b.writeUInt32BE(data, ofs)
			if ( tp == 'sw' ) return f.b.writeInt32BE(data, ofs)
			if ( tp == 'w' ) return f.b.writeUInt32BE(data, ofs)
		}
	} else if (f.c == 'elf64') {
		if (f.end == 'le') {
			if ( tp == 'a' ) return f.b.writeBigUInt64LE(data, ofs)
			if ( tp == 'h' ) return f.b.writeUInt16LE(data, ofs)
			if ( tp == 'o' ) return f.b.writeBigUInt64LE(data, ofs)
			if ( tp == 'sw' ) return f.b.writeInt32LE(data, ofs)
			if ( tp == 'w' ) return f.b.writeUInt32LE(data, ofs)
			if ( tp == 'sxw' ) return f.b.writeBigInt64LE(data, ofs)
			if ( tp == 'xw' ) return f.b.writeBigUInt64LE(data, ofs)
		} else {
			if ( tp == 'a' ) return f.b.writeBigUInt64BE(data, ofs)
			if ( tp == 'h' ) return f.b.writeUInt16BE(data, ofs)
			if ( tp == 'o' ) return f.b.writeBigUInt64BE(data, ofs)
			if ( tp == 'sw' ) return f.b.writeInt32BE(data, ofs)
			if ( tp == 'w' ) return f.b.writeUInt32BE(data, ofs)
			if ( tp == 'sxw' ) return f.b.writeBigInt64BE(data, ofs)
			if ( tp == 'xw' ) return f.b.writeBigUInt64BE(data, ofs)
		}
	}
}





///////////////////////////////// TAKE ALL FILES
let files = []

// file { 
// 	b: buffer,
// 	n: name,
// 	c: elf class ('elf32', 'elf64'),
//	end: endianness ('le', 'be'),
//	s: sections[]
//	shstrndx: sh string table index
// }

// section {
// 	ho: header offset
// 	do: data offset
// }


let args = process.argv

for (let i = 2; i<args.length; i++) { // 2 because ignore 0 (node) and 1 (main.js)

	let filename = args[i]

	try {
		files.push( {
			b: fs.readFileSync(filename), // buffer
			n: filename
		} )
	} catch(e) {
		bad(`Wtf is ${filename}`)
	}
}

if ( !files.length ) {
	bad('Where are them files?')
	return
}

for (let i = 0; i<files.length; i++) {
	let f = files[i]

	if (f.b.length < 16) { // eident is 16 bytes
		bad(`${f.n} is not valid object file. Ignoring`)
		files[i] = undefined
		continue
	}

	if ( f.b.compare( Buffer.from('\x7fELF'), 0, 4, 0, 4 ) ) { // if doesnt start with ELF
		bad(`${f.n} is not valid ELF file. Ignoring`)
		files[i] = undefined
		continue
	}

	if( f.b[4] == 1 ) f.c = 'elf32' // elf32 or elf64? (elf32, pg21)
	else if ( f.b[4] == 2) f.c = 'elf64'
	else {
		bad(`${f.n} is neither ELF32, nor ELF64. Ignoring`)
		files[i] = undefined
		continue
	}

	if( f.b[5] == 1 ) f.end = 'le' // le or be? (elf32, pg21)
	else if ( f.b[5] == 2) f.end = 'be'
	else {
		bad(`${f.n} is neither little nor big endian. Ignoring`)
		files[i] = undefined
		continue
	}

	if ( r(f, 16, 'h') != 1 ) { // rel, dyn, exec, core?
		bad(`${f.n} is not relocatable. Ignoring`)
		files[i] = undefined
		continue
	}

	if ( r(f, 20, 'w') != 1 ) { // current versionn (elf32, pg19)
		bad(`${f.n} is corrupted. Ignoring`)
		files[i] = undefined
		continue
	}

	// section header table offset rel to file
	let o = f.c == 'elf32' ? 32 : 40
	let sht = r(f, o, 'o')

	// number of sections
	o = f.c == 'elf32' ? 48 : 56
	let nSec = r(f, o, 'h')

	if (!nSec) {
		bad(`${f.n} doesn't have sections. Ignoring`)
		files[i] = undefined
		continue
	}

	// size of single section header
	o = f.c == 'elf32' ? 46 : 54
	let szSec = r(f, o, 'h')

	// shstrndx
	o = f.c == 'elf32' ? 50 : 58
	f.shstrndx = r(f, o, 'h')

	f.s = []
	for (let i = 0; i<nSec; i++) {
		f.s.push( {
			ho: sht + i * szSec
		} )
	}
}


files = files.filter(f => f) // trim


files.forEach(f => {
	succ(`${f.n} is valid elf, with len ${f.b.length}, class ${f.c}, endianness ${f.end}`)
})

