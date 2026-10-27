import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';
import { supabase } from './src/lib/supabase';

// Turns any error into a readable message, including the HTTP status if there is one.
async function describeError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    const response: Response = error.context;
    const body = await response.text().catch(() => '');
    return `HTTP ${response.status}: ${body || error.message}`;
  }
  if (error instanceof FunctionsRelayError) {
    return `Relay error: ${error.message}`;
  }
  if (error instanceof FunctionsFetchError) {
    return `Network error: ${error.message}`;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const status =
      'status' in error && error.status ? `HTTP ${error.status}: ` : '';
    return `${status}${String(error.message)}`;
  }
  return String(error);
}

function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      // a. Sign in anonymously if there's no saved session yet.
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const { error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) {
          throw signInError;
        }
      }

      // b. Call the "echo" edge function.
      const { data, error: invokeError } = await supabase.functions.invoke(
        'echo',
        { body: { text } },
      );
      if (invokeError) {
        throw invokeError;
      }

      // c. Show the response.
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setError(await describeError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.input}
          multiline
          value={text}
          onChangeText={setText}
          placeholder="Type something"
        />
        <Button title="Send" onPress={send} disabled={loading} />
        {loading && <ActivityIndicator />}
        {result && <Text selectable>{result}</Text>}
        {error && (
          <Text selectable style={styles.error}>
            {error}
          </Text>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    textAlignVertical: 'top',
  },
  error: {
    color: 'red',
  },
});

export default App;
