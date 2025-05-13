#include <iostream>
#include <Eigen/Dense>
#include <fstream>
#include <cstdlib>
#include <ctime>

/*
-----------------------------------
Input: 0 0 => Prediction: 0.0324625
Input: 0 1 => Prediction: 0.931244
Input: 1 0 => Prediction: 0.9312
Input: 1 1 => Prediction: 0.0897164
-----------------------------------
The current stats are really good, via the sigmoid
I am heading towards the token derivation
see ya
*/

using namespace std;
using namespace Eigen;

class NeuralNetwork {
    MatrixXd weights_input_hidden;
    VectorXd weights_hidden_output;

    double learning_rate = 0.1;

public:
    NeuralNetwork(int input_size, int hidden_size) {
        srand(time(0));

        weights_input_hidden = MatrixXd::Random(input_size, hidden_size);
        weights_hidden_output = VectorXd::Random(hidden_size);
    }

    double sigmoid(double x) {
        return 1.0 / (1.0 + exp(-x));
    }

    VectorXd sigmoid(const VectorXd& x) {
        return 1.0 / (1.0 + (-x.array()).exp());
    }

    VectorXd sigmoid_derivative(const VectorXd& x) {
        return x.array() * (1.0 - x.array());
    }

    double feedforward(const VectorXd& input) {
        VectorXd hidden = sigmoid(weights_input_hidden.transpose() * input);
        double output = sigmoid(hidden.dot(weights_hidden_output));
        return output;
    }

    void train(const VectorXd& input, double target) {
        VectorXd hidden = sigmoid(weights_input_hidden.transpose() * input);
        double output = sigmoid(hidden.dot(weights_hidden_output));

        double output_error = target - output;
        double output_delta = output_error * (output * (1.0 - output));

        VectorXd hidden_error = output_delta * weights_hidden_output;
        VectorXd hidden_delta = hidden_error.array() * hidden.array() * (1.0 - hidden.array());

        weights_hidden_output += learning_rate * output_delta * hidden;
        weights_input_hidden += learning_rate * input * hidden_delta.transpose();
    }

    void save(const std::string& filename) {
        std::ofstream file(filename, std::ios::binary);
        if (!file) {
            std::cerr << "Error opening file for saving weights.\n";
            return;
        }

        int rows = weights_input_hidden.rows();
        int cols = weights_input_hidden.cols();
        file.write(reinterpret_cast<const char*>(&rows), sizeof(int));
        file.write(reinterpret_cast<const char*>(&cols), sizeof(int));

        file.write(reinterpret_cast<const char*>(weights_input_hidden.data()), weights_input_hidden.size() * sizeof(double));
        file.write(reinterpret_cast<const char*>(weights_hidden_output.data()), weights_hidden_output.size() * sizeof(double));

        file.close();
        std::cout << "Weights saved successfully.\n";
    }

    void load(const std::string& filename) {
        std::ifstream file(filename, std::ios::binary);
        if (!file) {
            std::cerr << "Error opening file for loading weights.\n";
            std::cout << "Starting fresh.\n";
            return;
        }

        int rows, cols;
        file.read(reinterpret_cast<char*>(&rows), sizeof(int));
        file.read(reinterpret_cast<char*>(&cols), sizeof(int));
        
        if (rows <= 0 || cols <= 0) {
            std::cerr << "Invalid dimensions read from the file. Starting fresh.\n";
            weights_input_hidden = MatrixXd::Random(2, 2);
            weights_hidden_output = VectorXd::Random(2);
            return;
        }

        weights_input_hidden.resize(rows, cols);
        weights_hidden_output.resize(cols);

        file.read(reinterpret_cast<char*>(weights_input_hidden.data()), weights_input_hidden.size() * sizeof(double));
        file.read(reinterpret_cast<char*>(weights_hidden_output.data()), weights_hidden_output.size() * sizeof(double));

        if (file.gcount() != weights_input_hidden.size() * sizeof(double) + weights_hidden_output.size() * sizeof(double)) {
            std::cerr << "Warning: Not all weights loaded correctly. Starting fresh.\n";
            weights_input_hidden = MatrixXd::Random(2, 2);
            weights_hidden_output = VectorXd::Random(2);
        }

        file.close();
    }
};

int main() {
    NeuralNetwork nn(2, 2);
    nn.load("../../res/amar ai.brain");

    VectorXd input1(2); input1 << 0, 0;
    VectorXd input2(2); input2 << 0, 1;
    VectorXd input3(2); input3 << 1, 0;
    VectorXd input4(2); input4 << 1, 1;

    vector<VectorXd> inputs = {input1, input2, input3, input4};
    vector<double> targets = {0, 1, 1, 0};

    for (int epoch = 0; epoch < 10000; ++epoch) {
        for (size_t i = 0; i < inputs.size(); ++i) {
            nn.train(inputs[i], targets[i]);
        }
    }

    nn.save("../../res/amar ai.brain");

    for (size_t i = 0; i < inputs.size(); ++i) {
        double prediction = nn.feedforward(inputs[i]);
        cout << "Input: " << inputs[i].transpose() << " => Prediction: " << prediction << endl;
    }

    return 0;
}
