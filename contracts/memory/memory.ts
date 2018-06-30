import 'allocator/arena';
import * as eos from "../eoslib";

class Memory {
    value1 : i32;
    value2 : i32;
    value3 : string;
    value4 : i32;

    setValue4(i : i32) : void{
        i32.store(changetype<usize>(this) + offsetof<this>("value4"), i);
    }
}

export function apply(receiver : u64, code : u64, action : u64) : void {
    let memory = new Memory();
    // Getting the pointer to the 'memory' object
    let memory_p : usize = changetype<usize>(memory);
    eos.prints("Memory pointer: ".toUTF8());
    eos.printi(memory_p);
    // Getting the pointer to the 'memory' object
    let value1_offset : usize = offsetof<Memory>("value1");
    let value2_offset : usize = offsetof<Memory>("value2");
    i32.store(memory_p+value1_offset, 5);
    i32.store(memory_p+value2_offset, 100);
    eos.prints("\nValue 1: ".toUTF8());
    eos.printi(memory.value1);
    eos.prints("\nValue 2: ".toUTF8());
    eos.printi(memory.value2);

    let value3_offset : usize = offsetof<Memory>("value3");
    eos.prints("\nValue 3 offset: ".toUTF8());
    eos.printi(value3_offset);
    let value4_offset : usize = offsetof<Memory>("value4");
    eos.prints("\nValue 4 offset: ".toUTF8());
    eos.printi(value4_offset);

    memory.setValue4(500);
    eos.prints("\nValue 4: ".toUTF8());
    eos.printi(memory.value4);

    memory.value3 = "Hello world";
    let value3_p = changetype<usize>(memory) + value3_offset;
    eos.prints("\n".toUTF8());
    let string_p : i32 = i32.load8_u(value3_p);
    eos.printi(string_p);
    eos.prints("\n".toUTF8());
    let len = i32.load8_u(string_p); // 11
    // https://github.com/AssemblyScript/assemblyscript/wiki/Memory-Layout-&-Management
    // UTF16 by default
    // H = x48 x00 (x00 is also the end of line character for a UTF8 cstr)
    eos.prints(string_p + 4); //H
    eos.prints(string_p + 6); //e
    eos.prints(string_p + 8); //l
    eos.prints(string_p + 10);//l
    eos.prints(string_p + 12);//o
    eos.prints(string_p + 14); // 
    eos.prints(string_p + 16); //w
    eos.prints(string_p + 18); //o
    eos.prints(string_p + 20); //r
    eos.prints(string_p + 22); //l
    eos.prints(string_p + 24); //d
}