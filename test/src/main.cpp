#include <iostream>
#include <vector>
#include <cmath>
#include <cstdlib>
#include <ctime>
#include <fstream>

/*
-----------------------------------
Input: 0, 0 => Prediction: 0.492229
Input: 0, 1 => Prediction: 0.497748
Input: 1, 0 => Prediction: 0.499996
Input: 1, 1 => Prediction: 0.504663
-----------------------------------
The current stats are really good, via the sigmoid
I am heading towards the token derivation
see ya
*/

using namespace std;

double sigmoid(double x) {
    return 1.0 / (1.0 + exp(-x));
}

double sigmoid_derivative(double x) {
    return x * (1.0 - x);
}

class NeuralNetwork {
    vector<double> input;
    vector<double> hidden;
    double output;

    vector<vector<double>> weights_input_hidden;
    vector<double> weights_hidden_output;

    double learning_rate = 0.1;

public:
    NeuralNetwork(int input_size, int hidden_size) {
        srand(time(0));

        weights_input_hidden.resize(input_size, vector<double>(hidden_size));
        weights_hidden_output.resize(hidden_size);

        for (int i = 0; i < input_size; ++i)
            for (int j = 0; j < hidden_size; ++j)
                weights_input_hidden[i][j] = ((double)rand() / RAND_MAX) - 0.5;

        for (int i = 0; i < hidden_size; ++i)
            weights_hidden_output[i] = ((double)rand() / RAND_MAX) - 0.5;
    }

    double feedforward(const vector<double>& inputs) {
        input = inputs;
        hidden.resize(weights_hidden_output.size());

        for (size_t j = 0; j < hidden.size(); ++j) {
            double sum = 0.0;
            for (size_t i = 0; i < input.size(); ++i) {
                sum += input[i] * weights_input_hidden[i][j];
            }
            hidden[j] = sigmoid(sum);
        }

        double sum = 0.0;
        for (size_t j = 0; j < hidden.size(); ++j) {
            sum += hidden[j] * weights_hidden_output[j];
        }
        output = sigmoid(sum);

        return output;
    }

    void train(const vector<double>& inputs, double target) {
        feedforward(inputs);

        double output_error = target - output;
        double output_delta = output_error * sigmoid_derivative(output);

        vector<double> hidden_errors(hidden.size());
        vector<double> hidden_deltas(hidden.size());

        for (size_t j = 0; j < hidden.size(); ++j) {
            hidden_errors[j] = output_delta * weights_hidden_output[j];
            hidden_deltas[j] = hidden_errors[j] * sigmoid_derivative(hidden[j]);
        }

        for (size_t j = 0; j < hidden.size(); ++j) {
            weights_hidden_output[j] += learning_rate * output_delta * hidden[j];
        }

        for (size_t i = 0; i < input.size(); ++i) {
            for (size_t j = 0; j < hidden.size(); ++j) {
                weights_input_hidden[i][j] += learning_rate * hidden_deltas[j] * input[i];
            }
        }
    }

    void save(const std::string& filename) {
        std::ofstream file(filename, std::ios::binary);
        for (auto& row : weights_input_hidden)
            for (auto& w : row)
                file.write(reinterpret_cast<char*>(&w), sizeof(double));
        for (auto& w : weights_hidden_output)
            file.write(reinterpret_cast<char*>(&w), sizeof(double));
        file.close();
    }

    void load(const std::string& filename) {
        std::ifstream file(filename, std::ios::binary);
        if (!file) {
            std::cout << "No saved weights found. Starting fresh.\n";
            return;
        }
        for (auto& row : weights_input_hidden)
            for (auto& w : row)
                file.read(reinterpret_cast<char*>(&w), sizeof(double));
        for (auto& w : weights_hidden_output)
            file.read(reinterpret_cast<char*>(&w), sizeof(double));
        file.close();
    }
};

int main() {
    NeuralNetwork nn(2, 2);
    nn.load("../../res/amar ai.brain");

    vector<vector<double>> inputs = {
        {0, 0},
        {0, 1},
        {1, 0},
        {1, 1}
    };

    vector<double> targets = {0, 1, 1, 0};

    for (int epoch = 0; epoch < 10000; ++epoch) {
        for (size_t i = 0; i < inputs.size(); ++i) {
            nn.train(inputs[i], targets[i]);
        }
    }

    nn.save("../../res/amar ai.brain");

    for (size_t i = 0; i < inputs.size(); ++i) {
        double prediction = nn.feedforward(inputs[i]);
        cout << "Input: " << inputs[i][0] << ", " << inputs[i][1]
             << " => Prediction: " << prediction << endl;
    }

    return 0;
}
