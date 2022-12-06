pub struct ExternRef(i64);

extern "C" {
    fn externref_drop(extern_ref: i64);
}

impl From<i64> for ExternRef {
    fn from(i: i64) -> Self {
        ExternRef(i)
    }
}

impl Into<i64> for ExternRef {
    fn into(self) -> i64 {
        self.0
    }
}

impl Drop for ExternRef {
    fn drop(&mut self) {
        unsafe {
            externref_drop(self.0);
        }
    }
}
