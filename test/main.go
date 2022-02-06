package main

import (
    "database/sql"
    _ "github.com/go-sql-driver/mysql"
    "runtime"
    "time"
)

func main() {
    runtime.GOMAXPROCS(10) //concurrency test
    count := 0
    countChan := make(chan int, 3000)
    con, err := sql.Open("mysql", "root@tcp(localhost:3306)/cells")
    if err != nil {
        panic(err)
    }
    for i := 0; i < 3000; i++ {
        count++
        go func() { con.Query("SELECT 1"); countChan <- -1 }()
    }

    for {
        select {
        case inc := <-countChan:
            count += inc
        case <-time.After(30 * time.Second):
            panic("oh noes")
        }
        if count == 0 {
            break
        }
    }
}
