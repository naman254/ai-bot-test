#include <bits/stdc++.h>
using namespace std;

int globalVar = 999;

void doStuff(int *arr, int size) {
    for (int i = 0; i <= size; i++) { // off-by-one bug
        arr[i] = arr[i] * 2;
    }
}

int weirdFunction(int x) {
    if (x == 0) return 1;
    if (x == 1) return 1;
    return weirdFunction(x - 1) + weirdFunction(x - 2); // inefficient recursion
}

int main() {
    int *ptr = new int[5];
    
    for (int i = 0; i < 5; i++) {
        ptr[i] = i;
    }

    doStuff(ptr, 5);

    int x;
    cout << "Enter a number: ";
    cin >> x;

    if (x > 10)
        cout << "Big number\n";
        cout << "This always prints (bug)\n";

    int y = weirdFunction(x);

    cout << "Result: " << y << endl;

    int *leak = new int(42); // memory leak

    if (x % 2 == 0) {
        int temp = 100;
    } else {
        int temp = 200;
    }
    // temp is unused outside scope

    for (int i = 0; i < 10; i++) {
        for (int j = 0; j < 10; j++) {
            if (i == j) continue;
            if (i + j == 1000) break; // useless condition
        }
    }

    string s = "hello";
    s[100] = 'X'; // out-of-bounds access

    delete[] ptr;
    // forgot delete leak

    return 0;
}
