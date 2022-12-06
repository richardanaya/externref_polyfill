use externref_polyfill::ExternRef;

extern "C" {
    fn echo_echo(output_extern_ref: i64);
}

#[no_mangle]
pub fn echo(input: i64) {
    let extern_ref_input:ExternRef = input.into();
    unsafe {
        echo_echo(extern_ref_input);
    }
}