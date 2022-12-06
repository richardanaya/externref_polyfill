pub struct ExternRef {
    pub value: i64,
}

extern "C" {
    fn externref_drop(extern_ref: i64);
}

impl From<i64> for ExternRef {
    fn from(value: i64) -> Self {
        ExternRef { value }
    }
}

impl Into<i64> for &ExternRef {
    fn into(self) -> i64 {
        self.value
    }
}

impl Drop for ExternRef {
    fn drop(&mut self) {
        unsafe {
            externref_drop(self.value);
        }
    }
}
