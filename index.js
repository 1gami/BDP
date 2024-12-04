function generateTable() {
    const rows = parseInt(document.getElementById("rows").value);
    const columns = parseInt(document.getElementById("columns").value);
    const table = document.getElementById("data-table");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    const headerRow = document.createElement("tr");
    for (let i = 0; i < columns; i++) {
        const th = document.createElement("th");
        th.textContent = `열 ${i + 1}`;
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);

    for (let i = 0; i < rows; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < columns; j++) {
            const td = document.createElement("td");
            td.innerHTML = `<input type="number" class="data-input" value="0">`;
            row.appendChild(td);
        }
        tbody.appendChild(row);
    }
}

function calculateStats() {
    const table = document.getElementById("data-table");
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const data = rows.map(row =>
        Array.from(row.querySelectorAll("td input")).map(input => parseFloat(input.value))
    );

    const columnStats = calculateColumnStatistics(data);

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    const columnTable = createStatsTable(columnStats, "기술 통계량");
    resultsDiv.appendChild(columnTable);

    const regressionResults = performRegressionAnalysis(data);
    const regressionTable = createRegressionTable(regressionResults, "회귀 분석");
    resultsDiv.appendChild(regressionTable);

    const explanation = createRegressionExplanation();
    resultsDiv.appendChild(explanation);

    createVisualizations(data);
}

function calculateColumnStatistics(data) {
    const stats = {};
    const columnCount = data[0].length;

    for (let col = 0; col < columnCount; col++) {
        const columnData = data.map(row => row[col]);
        const n = columnData.length;
        const mean = columnData.reduce((a, b) => a + b, 0) / n;

        const variance =
            columnData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);

        const min = Math.min(...columnData);
        const max = Math.max(...columnData);

        const sorted = [...columnData].sort((a, b) => a - b);
        const median =
            n % 2 === 0
                ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
                : sorted[Math.floor(n / 2)];

        const sum = columnData.reduce((a, b) => a + b, 0);

        stats[`열 ${col + 1}`] = {
            평균: mean.toFixed(2),
            분산: variance.toFixed(2),
            표준편차: stdDev.toFixed(2),
            최소값: min.toFixed(2),
            최대값: max.toFixed(2),
            중앙값: median.toFixed(2),
            합계: sum.toFixed(2),
        };
    }

    return stats;
}

function createStatsTable(stats, title) {
    const table = document.createElement("table");
    table.className = "result-table";

    const caption = document.createElement("caption");
    caption.textContent = title;
    table.appendChild(caption);

    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th"));
    Object.keys(stats).forEach(column => {
        const th = document.createElement("th");
        th.textContent = column;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    const statNames = Object.keys(stats[Object.keys(stats)[0]]);
    statNames.forEach(statName => {
        const row = document.createElement("tr");
        const rowHeader = document.createElement("td");
        rowHeader.textContent = statName;
        row.appendChild(rowHeader);

        Object.values(stats).forEach(columnStats => {
            const td = document.createElement("td");
            td.textContent = columnStats[statName];
            row.appendChild(td);
        });

        table.appendChild(row);
    });

    return table;
}

function performRegressionAnalysis(data) {
    const y = data.map(row => row[0]);
    const xData = data.map(row => row.slice(1));

    const n = y.length;

    const xMatrix = xData.map(row => [1, ...row]);

    const xTranspose = math.transpose(xMatrix);
    const xTx = math.multiply(xTranspose, xMatrix);
    const xTxInv = math.inv(xTx);
    const xTy = math.multiply(xTranspose, y);
    const beta = math.multiply(xTxInv, xTy);

    const yPredicted = xMatrix.map(row => math.dot(row, beta));
    const residuals = y.map((val, idx) => val - yPredicted[idx]);

    const coefficients = beta.map((coef, idx) => ({
        변수: idx === 0 ? "상수항" : `x${idx}`,
        값: coef.toFixed(4),
    }));

    return {
        회귀계수: coefficients,
        예측값: yPredicted.map(pred => pred.toFixed(4)),
        잔차: residuals.map(res => res.toFixed(4)),
    };
}

function createRegressionTable(results, title) {
    const container = document.createElement("div");
    container.className = "regression-container";

    const caption = document.createElement("h3");
    caption.textContent = title;
    container.appendChild(caption);

    const coefTable = document.createElement("table");
    coefTable.className = "result-table";

    const coefHeaderRow = document.createElement("tr");
    ["변수", "계수 값"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        coefHeaderRow.appendChild(th);
    });
    coefTable.appendChild(coefHeaderRow);

    results.회귀계수.forEach(coef => {
        const row = document.createElement("tr");
        const varCell = document.createElement("td");
        varCell.textContent = coef.변수;
        const valCell = document.createElement("td");
        valCell.textContent = coef.값;
        row.appendChild(varCell);
        row.appendChild(valCell);
        coefTable.appendChild(row);
    });

    container.appendChild(coefTable);

    const predResTable = document.createElement("table");
    predResTable.className = "result-table";

    const predResHeaderRow = document.createElement("tr");
    ["데이터 - 행별", "예측값", "잔차"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        predResHeaderRow.appendChild(th);
    });
    predResTable.appendChild(predResHeaderRow);

    for (let i = 0; i < results.예측값.length; i++) {
        const row = document.createElement("tr");
        const idxCell = document.createElement("td");
        idxCell.textContent = i + 1;
        const predCell = document.createElement("td");
        predCell.textContent = results.예측값[i];
        const resCell = document.createElement("td");
        resCell.textContent = results.잔차[i];
        row.appendChild(idxCell);
        row.appendChild(predCell);
        row.appendChild(resCell);
        predResTable.appendChild(row);
    }

    container.appendChild(predResTable);

    return container;
}

function createRegressionExplanation() {
    const explanationDiv = document.createElement("div");
    explanationDiv.className = "regression-explanation";

    const explanation = `
        <h3>회귀 분석 설명</h3>
        <ul>
            <li><b>회귀계수:</b> 독립변수가 종속변수에 미치는 영향을 나타냅니다. 값이 클수록 영향이 큽니다.</li>
            <li><b>예측값:</b> 회귀 모델이 계산한 열 1의 예상값입니다.</li>
            <li><b>잔차:</b> 실제값과 예측값의 차이를 나타내며, 모델의 오차를 측정합니다.</li>
        </ul>
    `;

    explanationDiv.innerHTML = explanation;
    return explanationDiv;
}

function createVisualizations(data) {
    const visualDiv = document.createElement("div");
    visualDiv.className = "visualization-container";

    const boxplotCanvas = document.createElement("canvas");
    boxplotCanvas.id = "boxplot";
    visualDiv.appendChild(boxplotCanvas);

    const histogramCanvas = document.createElement("canvas");
    histogramCanvas.id = "histogram";
    visualDiv.appendChild(histogramCanvas);

    document.getElementById("results").appendChild(visualDiv);

    const allData = data.flat();

    const sortedData = [...allData].sort((a, b) => a - b);
    const min = Math.min(...allData);
    const max = Math.max(...allData);
    const median = sortedData[Math.floor(sortedData.length / 2)];
    const q1 = sortedData[Math.floor(sortedData.length * 0.25)];
    const q3 = sortedData[Math.floor(sortedData.length * 0.75)];

    const boxplotData = {
        labels: ["Boxplot"],
        datasets: [
            {
                label: "최소값",
                data: [min],
                backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
                label: "1사분위",
                data: [q1],
                backgroundColor: "rgba(54, 162, 235, 0.5)",
            },
            {
                label: "중앙값",
                data: [median],
                backgroundColor: "rgba(75, 192, 192, 0.5)",
            },
            {
                label: "3사분위",
                data: [q3],
                backgroundColor: "rgba(153, 102, 255, 0.5)",
            },
            {
                label: "최대값",
                data: [max],
                backgroundColor: "rgba(255, 159, 64, 0.5)",
            },
        ],
    };

    new Chart(boxplotCanvas, {
        type: "bar",
        data: boxplotData,
        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Boxplot (막대 차트)",
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Boxplot",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "값",
                    },
                },
            },
        },
    });

    const histogramLabels = [...new Set(sortedData)];
    const histogramData = {
        labels: histogramLabels,
        datasets: [
            {
                label: "Histogram",
                data: histogramLabels.map(
                    label => allData.filter(value => value === parseFloat(label)).length
                ),
                backgroundColor: "rgba(0, 123, 255, 0.5)",
            },
        ],
    };

    new Chart(histogramCanvas, {
        type: "bar",
        data: histogramData,
        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Histogram",
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "값",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "빈도",
                    },
                },
            },
        },
    });
}
