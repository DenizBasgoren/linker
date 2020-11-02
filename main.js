
let helpMsg = `
	Usage:

	// display help
	node main.js -h
	node main.js --help

	// link files
	node main.js file1 file2

	// link files and name output file
	node main.js file1 file2 -o myProgram
	node main.js file1 file2 --output myProgram

	// link files and also specify a custom linker script
	node main.js file1 file2 -c file.json
	node main.js file1 file2 --config file.json
`

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

Don't forget about sh_addralign when assigning section addresses

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


// typedef struct {
// 		Elf64_Word sh_name;			0
// 		Elf64_Word sh_type;			4
// 		Elf64_Xword sh_flags;		8
// 		Elf64_Addr sh_addr;			16
// 		Elf64_Off sh_offset;		24
// 		Elf64_Xword sh_size;		32
// 		Elf64_Word sh_link;			40
// 		Elf64_Word sh_info;			44
// 		Elf64_Xword sh_addralign;	48
// 		Elf64_Xword sh_entsize;		56
// } Elf64_Shdr;					64 total



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
	if (tp == 'str') {
		let cur = 0
		let str = ''
		try {
			while( f.b[ofs+cur] != 0) {
				str += String.fromCharCode(f.b[ofs+cur])
				cur++
			}
		}
		finally {
			return str
		}
	}

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



//////////////////////////////// DEFAULT LINKER SCRIPT
let ls = [
	{
		"type": "definition",
		"symbol": "_start"
	},
	{
		"type": "section",
		"file": "*",
		"section": ".text*"
	},
	{
		"type": "section",
		"file": "*",
		"section": ".data*"
	},
	{
		"type": "section",
		"file": "*",
		"section": ".bss*"
	},
	{
		"type": "section",
		"file": "*",
		"section": "*"
	}
]





///////////////////////////////// TAKE ALL FILES
let files = []

let out = {
	n: 'app.elf',
	sec: []
}


// file { 
// 	b: buffer,
// 	n: name,
// 	c: elf class ('elf32', 'elf64'),
//	end: endianness ('le', 'be'),
//	sec: sections[]
//	shstrndx: sh string table index
// }

// section {
//	n: name (string!)
// 	ho: header offset
// 	do: data offset
//	dsz: data size
//	tp:	'null', 'progbits', 'nobits', 'symtab', 'strtab', 'rel', 'rela', others ignored (elf32 pg25)
//	flg: {str: bool} where a,x,w (alloc, exec, write)
//	f:	file (backlink)
//	align: alignment in bytes
//	a: address (Bigint)
//	isRelocated: bool
// }

// segment {
//	tp: 'null', 'load', 'dynamic', 'interp', 'note', 'shlib', 'phdr' (elf32 pg41)
//	flg: {str: bool} where r,w,e (read, write, exec)
//	sec: sections[]
// }

// out {
//	sec: sections[]
// }


let args = process.argv
let argState = 'e' // (e)val, (o)utput, (c)onfig

for (let i = 2; i<args.length; i++) { // 2 because ignore 0 (node) and 1 (main.js)

	let arg = args[i]

	if (argState == 'e') {
		if (arg == '-h' || arg == '--help') {
			l(helpMsg)
			process.exit(0)
		}
		else if (arg == '-o' || arg == '--output') {
			argState = 'o'
		}
		else if (arg == 'c' || arg == '--config') {
			argState = 'c'
		}
		else {
			try {
				files.push( {
					b: fs.readFileSync(arg), // buffer
					n: arg
				} )
			} catch(e) {
				bad(`Can't find ${arg}`)
			}
		}
	}

	else if (argState == 'o') {
		out.n = arg
		argState = 'e'
	}

	else if (argState == 'c') {
		try {
			ls = JSON.parse( fs.readFileSync(arg, 'utf8') )
		}
		catch(e) {
			bad(`Failed reading linker script ${arg}`)
		}
		argState = 'e'
	}
}


///////////////////////////////// FILE SANITY CHECKS
if ( !files.length ) {
	bad('Where are them files?')
	process.exit(-1)
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

	if (f.shstrndx >= nSec ) {
		bad(`shstrtab of file ${f.n} points nowhere. Aborting`)
		process.exit(-1)
	}

	f.sec = []
	for (let i = 0; i<nSec; i++) {
		f.sec.push( {
			ho: sht + i * szSec,
			f: f // back link to file
		} )
	}
}


files = files.filter(f => f) // trim


files.forEach(f => {
	// succ(`${f.n} is valid elf, with len ${f.b.length}, class ${f.c}, endianness ${f.end}`)
})


///////////////////////////////////// GET SECTIONS

for (let i = 0; i<files.length; i++) { // for all files
	let f = files[i] // file

	// succ(`File ${f.n}:`)

	for (let j = 0; j<f.sec.length; j++) { // for all section headers
		let h = f.sec[j] // header

		// section type (elf32 pg25)
		let tp = r(f, h.ho + 4, 'w')
		if (tp == 0) h.tp = 'null'
		else if (tp == 1) h.tp = 'progbits'
		else if (tp == 2) h.tp = 'symtab'
		else if (tp == 3) h.tp = 'strtab'
		else if (tp == 4) h.tp = 'rela'
		else if (tp == 5) h.tp = 'hash'
		else if (tp == 6) h.tp = 'dynamic'
		else if (tp == 7) h.tp = 'note'
		else if (tp == 8) h.tp = 'nobits'
		else if (tp == 9) h.tp = 'rel'
		else if (tp == 10) h.tp = 'shlib'
		else if (tp == 11) h.tp = 'dynsym'
		else h.tp = ''

		// section flags
		let flg
		if ( f.c == 'elf32') flg = r( f, h.ho + 8, 'w')
		else flg = r( f, h.ho + 8, 'xw')
		
		h.flg = {
			x: flg % 8 >= 4,
			a: flg % 4 >= 2,
			w: flg % 2 == 1
		}

		// data offset + size
		let o = f.c == 'elf32' ? 16 : 24
		h.do = r( f, h.ho + o, 'o')

		if (f.c == 'elf32') h.dsz = r( f, h.ho + 20, 'w')
		else h.dsz = r(f, h.ho + 32, 'xw')

		// alignment
		if (f.c == 'elf32') h.align = r( f, h.ho + 32, 'w')
		else h.align = r(f, h.ho + 48, 'xw')

		if (h.align == 0) { // Alignment of 1 and 0 means don't align (elf32, pg25)
			// nop
		}



	}
}



///////////////////// ASSIGN NAMES OF SECTIONS

for (let i = 0; i<files.length; i++) { // for all files
	let f = files[i] // file

	// name
	let sec = f.sec[f.shstrndx].do // start of shstrtab section bytes
	
	
	for (let j = 0; j<f.sec.length; j++) { // for all section headers
		let h = f.sec[j] // header
		
		// same for both elf32, elf64
		let ni = r(f, h.ho, 'w') // name index in f.shstrndx

		h.n = r(f, sec+ni, 'str')

		// succ(`${j} ${h.n}: ${h.flg.a?'a':' '}${h.flg.w?'w':' '}${h.flg.x?'x':' '}${h.do}+${h.dsz} (${h.tp})`)
		
	}
}

// sort according to flags
// out.sec.sort((a,b) => {
// 	let scrA = a.flg.w*4 + a.flg.x*2 + (a.tp=='nobits')
// 	let scrB = b.flg.w*4 + b.flg.x*2 + (b.tp=='nobits')
// 	return scrA - scrB
// })


// Array(100).fill(true).map(t => {
// 	let luck = () => Math.random() > 0.5

// 	return {
// 		flg: { w: luck(), x: luck() },
// 		tp: luck() ? 'progbits' : 'nobits'
// 	}
// }).sort((a,b) => {
// 	let scrA = a.flg.w*4 + a.flg.x*2 + (a.tp=='nobits')
// 	let scrB = b.flg.w*4 + b.flg.x*2 + (b.tp=='nobits')
// 	return scrA - scrB
// }).map(s => {
// 	s.flg = `${s.flg.x?'x':''},${s.flg.w?'w':''}`
// 	return s
// })


let deserializeRegex = r => {
	let regex = r.split('').map(l => {
		let c = l.charCodeAt(0)
		if (c>=65 && c<=90) return l
		if (c>=97 && c<=122) return l
		if (c == 42) return '.*' // wildcard
		return '\\' + l
	}).join('')
	return new RegExp(regex)
}


///////////////////////////////// LINKER SCRIPT FORMAT
// {
// 	type: 'section'
// 	file: '*' // * is wildcard
// 	section: '.text.*'
// }

// {
// 	type: 'padding'
// 	moveTo?: 123 or '123'
// 	moveBy?: 123 or '123'
// 	alignTo?: 4 or '4'
// }

// {
// 	type: 'definition'
// 	symbol: 'symbolname'
// }

// {
// 	type: 'assertion'
// 	lessThan: 123 or '123'
//	greaterThan: 123 or '123
// }



RegExp.prototype.text = function(a) {
	l(`cmp ${this} with ${a} : ${this.test(a)}`)
	return this.test(a)
}

//////////////////////////////// RELOCATION PROCESS
let ad = 0 // why not start from zero, ld? :/
let syms = {} // symbols from linker script

if ( !ls.length ) {
	bad(`Linker script is not formatted properly. Aborting`)
	process.exit(-1)
}


for (let entry = 0; entry<ls.length; entry++) { // for all entries in linker script

	let e = ls[entry]

	/////////////////////
	if (e.type == 'section') { // the main thing
		
		for (let i = 0; i<files.length; i++) { // for all files
			let f = files[i] // file


			if ( !deserializeRegex(e.file).text(f.n) ) continue
		
			for (let j = 0; j<f.sec.length; j++) { // for all section headers
				let h = f.sec[j] // header

				if (!h.flg.a || h.isRelocated ) continue

				if ( !deserializeRegex(e.section).text(h.n) ) continue

				h.isRelocated = true
				// succ(`${i}/${j}`)

				out.sec.push( h )

				// before assigning address, adjust sh_align
				if ( h.align > 1) { // if 0 or 1, don't align (elf32, pg25)
					ad += h.align - (ad % h.align || h.align)
				}

				// relocate finally =)
				h.a = ad
				ad += h.dsz // same for nobits

			}
		}
		
	}

	////////////////////
	else if (e.type == 'padding') {
		try {
			let n = BigInt(e.moveTo || e.moveBy || e.alignTo)
		}
		catch(er) {
			bad(`Entry ${entry+1} of linker script is not formatted properly. Aborting `)
			process.exit(-1)
		}

		if (e.moveTo) {
			if (n < ad) {
				bad(`Can't move back as per entry ${entry+1}. Aborting`)
				process.exit(-1)
			}
			ad = n
		}
		else if (e.moveBy) {
			if (n < 0) {
				bad(`Can't move back as per entry ${entry+1}. Aborting`)
				process.exit(-1)
			}
			ad += n
		}
		else { // e.alignTo
			if (n == 0) {
				bad(`Can't align to zero. Aborting`)
				process.exit(-1)
			}
			else if (n == 1) {
				// nop
			}
			else {
				ad += n - (ad % n || n )
			}
		}
	}

	///////////////////////////
	else if (e.type == 'definition') {
		if ( !e.symbol ) {
			bad(`Entry ${entry+1} of linker script is not formatted properly. Aborting `)
			process.exit(-1)
		}
		syms[e.symbol] = ad
	}

	///////////////////////////
	else if (e.type == 'assertion') {
		try {
			let expected = BigInt(e.lessThan || e.greaterThan)
		}
		catch(er) {
			bad(`Entry ${entry+1} of linker script is not formatted properly. Aborting `)
			process.exit(-1)
		}

		if (e.lessThan) {
			if (ad >= e.lessThan) {
				bad(`Assertion at entry ${entry+1} failed. Aborting`)
				process.exit(-1)
			}
		}
		else { // e.greaterThan
			if (ad <= e.greaterThan) {
				bad(`Assertion at entry ${entry+1} failed. Aborting`)
				process.exit(-1)
			}
		}
	}

	///////////////////////////
	else {
		bad(`Entry ${entry+1} of linker script is not formatted properly. Aborting `)
		process.exit(-1)
	}
}


l(out.sec)