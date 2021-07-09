const express = require("express");
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.listen(3000, function () {
    console.log("Running on port 3000");
});

const request = require("request");
const cheerio = require("cheerio");
const { render } = require("ejs");

app.get("/", async function (req, res) {
    var number = "02000141";
    let cnt = 0;
    let arr = [];
    while (cnt <= 1) {
        for (let i = number.length - 1; i >= 0; i--) {
            let value;
            if (parseInt(number[i]) == 9) {
                value = 0;
                number = number.slice(0, i);
                let num = i;
                while (num < 8) {
                    number += "0";
                    num++;
                }
                continue;
            } else {
                value = parseInt(number[i]) + 1;
                let tmp = number;
                number = number.slice(0, i);
                number += value.toString();
                if (i < number.length) {
                    number += tmp.slice(i + 1);
                }
                break;
            }
        }
        cnt++;
        await request(
            `http://vietnamnet.vn/vn/giao-duc/tra-cuu-diem-thi-thpt/?y=2020&sbd=${number}`,
            function async(err, response, body) {
                if (err) {
                    console.log(err);
                } else {
                    $ = cheerio.load(body);
                    let pSbd = $(body).find("p");
                    let sbd;
                    let dem = 0;
                    pSbd.each(function (i, e) {
                        let tmp = $(e).find("span").text();
                        console.log(tmp);
                        if (tmp.length > 0) {
                            if (dem == 0) {
                                sbd = tmp;
                            }
                            dem++;
                        }
                    });

                    let list = $(body).find("tr");
                    let result = [];
                    list.each(function (i, e) {
                        // console.log($(this).text());
                        //console.log(e["attribs"]);
                        let data = $(e).find("td").text();
                        console.log(data);
                        if (data != "" && data.length <= 17) {
                            let index;
                            for (let i = data.length - 1; i >= 0; i--) {
                                if (
                                    data[i] != "." &&
                                    (data.charCodeAt(i) <= 47 ||
                                        data.charCodeAt(i) >= 58)
                                ) {
                                    index = i;
                                    break;
                                }
                            }
                            let dataNumber = data.slice(index + 1);
                            result.push({
                                // link: $(e).find("a").attr("href"),
                                // data: $(e).find("a").text(),
                                sbd: sbd,

                                diem: dataNumber,
                            });
                            if (result.length == 9) {
                                arr.push(result);
                            }
                            if (arr.length == 2) {
                                console.log("arr: ", arr);
                                res.render("trangchu.ejs", {
                                    data: JSON.stringify(arr),
                                });
                            }
                        }
                    });

                    // for (let i = 3; i < result.length; i++) {
                    //     console.log(result[i]);
                    // }
                    // res.render("trangchu.ejs", { data: result });
                }
            }
        );
    }
});
