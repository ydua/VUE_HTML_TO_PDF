const Vue = require("vue");
const path = require('path');
const { createRenderer } = require('vue-server-renderer');
const renderer = createRenderer();
const fs = require('fs');
const puppeteer = require('puppeteer');

async function generateHtml(htmlFilePath,templateUrl,jsonData) {

    // let templatePath = path.resolve(`./template/vue-template.html`);
    // console.log("template Path : "+ templatePath);

    // console.log("inside generateHTML");
    let htmlTemplate = `<div>`+ templateUrl + '</div>';
    // let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    const app = new Vue({
      template: htmlTemplate,
      data : jsonData,
      created() {
        // this.getAllData();
        this.getAllData1();
      },
      methods: {
        sortedList(array,field) {
            return array.sort((a, b) => a[field] - b[field]);
        },
        // // getAllData() {
        // //     axios
        // //         .get(this.endpoint)
        // //         .then((response) => {
        // //             this.reportCardData = response.data;
        // //             this.schoolModel = this.reportCardData.school_model;
        // //             this.studentExamModel = this.reportCardData.student_exam_models;
        // //             console.log(this.studentExamModel);
        // //         })
        // //         .catch((error) => {
        // //             console.log("-----error-------");
        // //             console.log(error);
        // //         });
        // // },
        getAllData1() {
                    console.log("jsonData : " + jsonData);
                    console.log(jsonData);
                    // this.rData = jsonData;
                    // this.firstName = this.rData.firstName;
                    this.jsonData = jsonData;
                    console.log("this.jsonData");
                    console.log(this.jsonData);
                    // this.reportCardData = response.data;
                    // this.schoolModel = this.reportCardData.school_model;
                    // this.studentExamModel = this.reportCardData.student_exam_models;
                    // console.log(this.studentExamModel);
        },
      }
    });

    console.log("inside generateHTML HTML : "+ htmlTemplate);

    // htmlFilePath = path.resolve(`./reportCard-out/reportCard_${token}.html`);
    console.log("html File Path : " + htmlFilePath);

    return new Promise((resolve, reject) => {
      renderer.renderToString(app, (err, html) => {
        if (err)
          reject(err);

        fs.writeFileSync(htmlFilePath, html, 'utf-8');

        resolve(htmlFilePath);
      });
    })
  }


  //convert html to pdf
  async function createPdf(htmlFilePath, pdfFilePath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.viewport({
      height: 900,
      width: 1400
    });

    await page.goto(htmlFilePath, {waitUntil: 'load'});

    await page.screenshot();

    await page.pdf({
      path: pdfFilePath,
      format: 'A4',
      margin: {
        top: '0px',
        right: '0px',
        left: '0px',
        bottom: '0px',
      }
    });

    await browser.close();

    return path.resolve(pdfFilePath);
  }

  module.exports ={
      generateHtml,
      createPdf
  };